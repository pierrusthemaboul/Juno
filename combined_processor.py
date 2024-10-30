import os
import json
import time
import asyncio
import logging
import aiohttp
import aiofiles
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path
from PIL import Image
from supabase import create_client, Client

class RateLimitedDALLEProcessor:
    def __init__(self, api_key: str, supabase_url: str, supabase_key: str, max_requests_per_minute: int = 5):
        self.api_key = api_key
        self.max_requests_per_minute = max_requests_per_minute
        self.request_timestamps: List[float] = []
        self.retry_delays = [1, 2, 4, 8, 16]
        self.logger = self._setup_logger()
        
        # Initialisation de Supabase
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Création des dossiers nécessaires
        self.downloads_dir = Path('downloaded_images')
        self.temp_dir = Path('temp_compressed')
        self.downloads_dir.mkdir(exist_ok=True)
        self.temp_dir.mkdir(exist_ok=True)

    def _setup_logger(self) -> logging.Logger:
        logger = logging.getLogger('DALLEProcessor')
        logger.setLevel(logging.INFO)
        
        Path('logs').mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(f'logs/dalle_processor_{datetime.now():%Y%m%d_%H%M%S}.log')
        file_handler.setLevel(logging.INFO)
        
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger

    async def _wait_for_rate_limit(self) -> None:
        now = time.time()
        self.request_timestamps = [ts for ts in self.request_timestamps if now - ts < 60]
        
        if len(self.request_timestamps) >= self.max_requests_per_minute:
            oldest_timestamp = min(self.request_timestamps)
            wait_time = 60 - (now - oldest_timestamp)
            if wait_time > 0:
                self.logger.info(f"Rate limit atteint. Attente de {wait_time:.2f} secondes")
                await asyncio.sleep(wait_time)

    async def generate_image(self, prompt: str, retry_count: int = 0) -> Dict[str, Any]:
        await self._wait_for_rate_limit()
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "model": "dall-e-3"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.openai.com/v1/images/generations",
                    headers=headers,
                    json=data
                ) as response:
                    self.request_timestamps.append(time.time())
                    
                    if response.status == 200:
                        result = await response.json()
                        self.logger.info(f"Image générée avec succès pour le prompt: {prompt[:100]}...")
                        return {
                            'status': 'success',
                            'url': result['data'][0]['url'],
                            'prompt': prompt,
                            'timestamp': datetime.now().isoformat()
                        }
                    
                    error_data = await response.text()
                    self.logger.error(f"Erreur API ({response.status}): {error_data}")
                    
                    if response.status == 429:
                        retry_after = int(response.headers.get('Retry-After', 60))
                        self.logger.warning(f"Rate limit atteint. Attente de {retry_after} secondes")
                        await asyncio.sleep(retry_after)
                        return await self.generate_image(prompt, retry_count)
                    
                    elif response.status in [500, 502, 503, 504]:
                        if retry_count < len(self.retry_delays):
                            delay = self.retry_delays[retry_count]
                            self.logger.warning(f"Erreur serveur. Retry dans {delay} secondes")
                            await asyncio.sleep(delay)
                            return await self.generate_image(prompt, retry_count + 1)
                    
                    return {
                        'status': 'error',
                        'error': error_data,
                        'prompt': prompt,
                        'timestamp': datetime.now().isoformat()
                    }
                    
        except Exception as e:
            self.logger.error(f"Erreur lors de la génération: {str(e)}")
            if retry_count < len(self.retry_delays):
                delay = self.retry_delays[retry_count]
                self.logger.warning(f"Tentative de retry dans {delay} secondes")
                await asyncio.sleep(delay)
                return await self.generate_image(prompt, retry_count + 1)
            
            return {
                'status': 'error',
                'error': str(e),
                'prompt': prompt,
                'timestamp': datetime.now().isoformat()
            }

    async def download_and_process_image(self, url: str, event_id: str) -> str:
        """Télécharge et compresse l'image"""
        filename = f"{event_id}_{int(time.time())}.jpg"
        original_path = self.downloads_dir / filename
        webp_filename = filename.replace('.jpg', '.webp')
        compressed_path = self.temp_dir / webp_filename

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        raise Exception(f"Erreur de téléchargement: {response.status}")
                    
                    async with aiofiles.open(original_path, 'wb') as f:
                        await f.write(await response.read())

            # Compression
            image = Image.open(original_path)
            if max(image.size) > 1200:
                ratio = 1200 / max(image.size)
                new_size = tuple(int(dim * ratio) for dim in image.size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)

            # Sauvegarde en WebP
            image.save(str(compressed_path), 'WEBP', quality=85)
            
            # Nettoyage du fichier original
            original_path.unlink()
            
            return str(compressed_path)

        except Exception as e:
            self.logger.error(f"Erreur lors du traitement de l'image pour {event_id}: {str(e)}")
            if original_path.exists():
                original_path.unlink()
            raise

    async def upload_to_supabase(self, file_path: str, event_id: str) -> str:
        """Upload l'image vers Supabase et met à jour l'événement"""
        try:
            filename = os.path.basename(file_path)
            
            with open(file_path, 'rb') as f:
                response = self.supabase.storage \
                    .from_('evenements-image') \
                    .upload(filename, f)

            if response.data is None:
                raise Exception(f"Erreur lors de l'upload: {response.error}")

            # Obtenir l'URL publique
            public_url = self.supabase.storage \
                .from_('evenements-image') \
                .get_public_url(filename)

            # Mettre à jour l'événement dans la base de données
            self.supabase.table('evenements') \
                .update({'illustration_url': public_url}) \
                .eq('id', event_id) \
                .execute()

            return public_url

        except Exception as e:
            self.logger.error(f"Erreur Supabase pour {event_id}: {str(e)}")
            raise

    async def process_batch(self, events: List[Dict[str, Any]], batch_size: int = 5) -> List[Dict[str, Any]]:
        """Traite un lot d'événements avec rate limiting"""
        results = []
        for i in range(0, len(events), batch_size):
            batch = events[i:i + batch_size]
            self.logger.info(f"Traitement du batch {i//batch_size + 1}, "
                         f"événements {i+1}-{min(i+batch_size, len(events))}")
            
            for event in batch:
                try:
                    # Génération du prompt
                    prompt = f"Historical scene depicting {event['titre_anglais']} in " \
                            f"{event['epoque']} era. {', '.join(event['types_evenement'])} " \
                            f"scene, Detailed and historically accurate representation. " \
                            f"No text in the image."
                    
                    # Génération de l'image
                    image_result = await self.generate_image(prompt)
                    
                    if image_result['status'] == 'success':
                        # Téléchargement et compression
                        processed_path = await self.download_and_process_image(
                            image_result['url'],
                            event['id']
                        )
                        
                        # Upload vers Supabase
                        public_url = await self.upload_to_supabase(processed_path, event['id'])
                        
                        results.append({
                            'event_id': event['id'],
                            'status': 'success',
                            'public_url': public_url,
                            'prompt': prompt,
                        })
                        
                        # Nettoyage du fichier temporaire
                        Path(processed_path).unlink()
                    else:
                        results.append({
                            'event_id': event['id'],
                            'status': 'error',
                            'error': image_result.get('error', 'Unknown error'),
                            'prompt': prompt,
                        })
                
                except Exception as e:
                    results.append({
                        'event_id': event['id'],
                        'status': 'error',
                        'error': str(e),
                        'prompt': prompt if 'prompt' in locals() else None,
                    })
                    self.logger.error(f"Erreur lors du traitement de l'événement {event['id']}: {str(e)}")
            
            # Attente entre les batchs
            if i + batch_size < len(events):
                self.logger.info("Pause entre les batchs...")
                await asyncio.sleep(12)
        
        return results

    async def save_results(self, results: List[Dict[str, Any]], 
                         output_file: str = 'dalle_results.json') -> None:
        """Sauvegarde les résultats dans un fichier JSON"""
        async with aiofiles.open(output_file, 'w') as f:
            await f.write(json.dumps({
                'total_images': len(results),
                'successful': len([r for r in results if r['status'] == 'success']),
                'timestamp': datetime.now().isoformat(),
                'results': results
            }, indent=2))
        
        self.logger.info(f"Résultats sauvegardés dans {output_file}")