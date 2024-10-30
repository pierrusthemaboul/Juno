import os
import re
import csv
import json
import uuid
import time
import logging
import requests
import pandas as pd
import asyncio
import nltk
import aiohttp
import aiofiles
from datetime import datetime, timedelta
from pathlib import Path
import unicodedata
from PIL import Image
import concurrent.futures
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from supabase import create_client, Client
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

class ConfigManager:
    """Gestionnaire de configuration"""
    
    DEFAULT_CONFIG = {
        'supabase_url': "https://ppxmtnuewcixbbmhnzzc.supabase.co",
        'supabase_key': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U",
        'batch_size': 20,
        'max_retries': 3,
        'concurrent_downloads': 4,
        'compression_quality': 80,
        'max_image_size': 1200,
        'directories': {
            'downloads': 'downloaded_images',
            'temp': 'temp_compressed',
            'reports': 'reports',
            'logs': 'logs'
        }
    }

    def __init__(self, config_file='config.json'):
        self.config_file = config_file
        self.config = self.load_config()
        self.create_directories()

    def load_config(self):
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    user_config = json.load(f)
                    return {**self.DEFAULT_CONFIG, **user_config}
            return self.DEFAULT_CONFIG
        except Exception as e:
            logging.error(f"Erreur de chargement de la configuration: {e}")
            return self.DEFAULT_CONFIG

    def create_directories(self):
        for dir_path in self.config['directories'].values():
            Path(dir_path).mkdir(parents=True, exist_ok=True)

class ReportManager:
    """Gestionnaire de rapports"""
    
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.events_processed = []
        self.setup_report_files()

    def setup_report_files(self):
        self.report_paths = {
            'main': self.base_dir / f"main_report_{self.timestamp}.csv",
            'errors': self.base_dir / f"errors_{self.timestamp}.csv",
            'dalle_stats': self.base_dir / f"dalle_stats_{self.timestamp}.csv",
            'summary': self.base_dir / f"summary_{self.timestamp}.txt",
            'batch_tracking': self.base_dir / f"batch_tracking_{self.timestamp}.json"
        }

    def add_event_result(self, result):
        self.events_processed.append({
            'timestamp': datetime.now().isoformat(),
            'event_id': result.get('event_id'),
            'ancien_nom': result.get('original_filename'),
            'nouveau_nom': result.get('new_filename'),
            'url_supabase': result.get('public_url'),
            'status': result.get('status'),
            'dalle_prompt': result.get('prompt_used'),
            'content_warnings': json.dumps(result.get('content_issues', [])),
            'processing_time': result.get('processing_time'),
            'image_size_original': result.get('original_size'),
            'image_size_compressed': result.get('compressed_size'),
            'compression_ratio': result.get('compression_ratio'),
            'batch_number': result.get('batch_number'),
            'retry_count': result.get('retry_count', 0)
        })

    def save_batch_state(self, batch_info):
        with open(self.report_paths['batch_tracking'], 'w') as f:
            json.dump(batch_info, f)

    def generate_reports(self):
        self._generate_main_report()
        self._generate_error_report()
        self._generate_dalle_stats()
        self._generate_summary()
        return self.report_paths

    def _generate_main_report(self):
        df = pd.DataFrame(self.events_processed)
        df.to_csv(self.report_paths['main'], index=False, encoding='utf-8')

    def _generate_error_report(self):
        errors = [event for event in self.events_processed if event['status'] == 'error']
        if errors:
            df = pd.DataFrame(errors)
            df.to_csv(self.report_paths['errors'], index=False, encoding='utf-8')

    def _generate_dalle_stats(self):
        stats = {
            'total_prompts': len(self.events_processed),
            'successful_generations': len([e for e in self.events_processed if e['status'] == 'success']),
            'failed_generations': len([e for e in self.events_processed if e['status'] == 'error']),
            'average_processing_time': self._calculate_average_processing_time(),
            'content_warnings_count': len([e for e in self.events_processed if e['content_warnings'] != '[]']),
            'total_batches': len(set(e['batch_number'] for e in self.events_processed)),
            'total_retries': sum(e['retry_count'] for e in self.events_processed)
        }
        pd.DataFrame([stats]).to_csv(self.report_paths['dalle_stats'], index=False)

    def _calculate_average_processing_time(self):
        times = [e['processing_time'] for e in self.events_processed if e['processing_time']]
        return sum(times) / len(times) if times else 0

    def _generate_summary(self):
        successful = len([e for e in self.events_processed if e['status'] == 'success'])
        total = len(self.events_processed)
        
        with open(self.report_paths['summary'], 'w', encoding='utf-8') as f:
            f.write(f"Rapport de traitement DALL-E - {self.timestamp}\n")
            f.write("=" * 50 + "\n\n")
            
            f.write("1. Statistiques générales\n")
            f.write(f"   - Total des événements: {total}\n")
            f.write(f"   - Succès: {successful}\n")
            f.write(f"   - Échecs: {total - successful}\n")
            f.write(f"   - Taux de réussite: {(successful/total*100):.1f}%\n\n")
            
            f.write("2. Détails du traitement\n")
            if self.events_processed:
                total_size_orig = sum(e['image_size_original'] for e in self.events_processed if e['image_size_original'])
                total_size_comp = sum(e['image_size_compressed'] for e in self.events_processed if e['image_size_compressed'])
                avg_ratio = sum(e['compression_ratio'] for e in self.events_processed if e['compression_ratio']) / len(self.events_processed)
                
                f.write(f"   - Taille totale originale: {total_size_orig/1024/1024:.2f} MB\n")
                f.write(f"   - Taille totale compressée: {total_size_comp/1024/1024:.2f} MB\n")
                f.write(f"   - Ratio moyen de compression: {avg_ratio:.1f}%\n\n")
            
            f.write("3. Alertes de contenu\n")
            content_warnings = [e for e in self.events_processed if e['content_warnings'] != '[]']
            if content_warnings:
                for event in content_warnings:
                    f.write(f"   - Événement {event['event_id']}: {event['content_warnings']}\n")
            else:
                f.write("   Aucune alerte de contenu\n\n")
            
            f.write("4. URLs des images générées\n")
            for event in self.events_processed:
                if event['status'] == 'success':
                    f.write(f"   - {event['nouveau_nom']}: {event['url_supabase']}\n")

class DALLEProcessor:
    """Processeur principal pour DALL-E"""
    
    def __init__(self, config_manager):
        self.config = config_manager.config
        self.report_manager = ReportManager(self.config['directories']['reports'])
        self.setup_supabase()
        self.setup_selenium()
        nltk.download('punkt')
        nltk.download('stopwords')

    def setup_supabase(self):
        self.supabase = create_client(
            self.config['supabase_url'],
            self.config['supabase_key']
        )

    def setup_selenium(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )

    def check_content_policy(self, event):
        """Vérifie la conformité avec la politique de contenu de DALL-E"""
        sensitive_terms = {
            'violence': ['guerre', 'bataille', 'mort', 'tuer', 'assassinat'],
            'politique': ['exécution', 'génocide', 'dictateur'],
            'controverse': ['terrorisme', 'attentat', 'massacre']
        }
        
        issues = []
        text = f"{event['titre']} {event.get('description', '')}".lower()
        
        for category, terms in sensitive_terms.items():
            found_terms = [term for term in terms if term in text]
            if found_terms:
                issues.append({
                    'category': category,
                    'terms': found_terms
                })
        
        return issues

    def generate_prompt(self, event, content_issues):
        """Génère un prompt adapté pour DALL-E"""
        base_prompt = f"Historical scene depicting {event.get('titre_anglais', event['titre'])} "
        
        if 'epoque' in event:
            base_prompt += f"in {event['epoque']} era. "
            
        if 'types_evenement' in event:
            event_types = ', '.join(event['types_evenement'])
            base_prompt += f"{event_types} scene, "
            
        if content_issues:
            # Adapter le prompt en fonction des problèmes de contenu
            adaptations = {
                'violence': "showing the aftermath and historical significance",
                'politique': "focusing on the architectural and cultural context",
                'controverse': "depicting the historical setting and symbolic representation"
            }
            
            for issue in content_issues:
                if issue['category'] in adaptations:
                    base_prompt += adaptations[issue['category']] + ", "
        
        base_prompt += "Detailed and historically accurate representation. No text in the image."
        return base_prompt

    async def generate_dalle_image(self, prompt, session):
        """Génère une image avec DALL-E"""
        # Ici, vous devez implémenter l'appel à l'API DALL-E
        # Pour l'instant, retournons une URL de test
        return "https://example.com/test-image.jpg"

    async def download_and_process_image(self, url, event_id, session):
        """Télécharge et traite l'image"""
        download_dir = self.config['directories']['downloads']
        temp_dir = self.config['directories']['temp']
        
        async with session.get(url) as response:
            if response.status != 200:
                raise Exception(f"Erreur de téléchargement: {response.status}")
                
            # Sauvegarder l'image originale
            filename = f"{event_id}_{uuid.uuid4().hex[:8]}.jpg"
            original_path = os.path.join(download_dir, filename)
            
            async with aiofiles.open(original_path, mode='wb') as f:
                await f.write(await response.read())
            
            # Compresser l'image
            compressed_path = os.path.join(temp_dir, filename.replace('.jpg', '.webp'))
            await self.compress_image(original_path, compressed_path)
            
            return compressed_path

    async def compress_image(self, input_path, output_path):
        """Compresse l'image en WebP"""
        image = Image.open(input_path)
        
        # Redimensionner si nécessaire
        max_size = self.config['max_image_size']
        if image.width > max_size or image.height > max_size:
            image.thumbnail((max_size, max_size))
        
        # Sauvegarder en WebP
        image.save(
            output_path, 
            'WEBP', 
            quality=self.config['compression_quality'],
            method=6
        )
        return output_path

    def calculate_compression_ratio(self, original_path):
        """Calcule le ratio de compression"""
        original_size = os.path.getsize(original_path)
        compressed_size = os.path.getsize(original_path.replace('.jpg', '.webp'))
        return ((original_size - compressed_size) / original_size) * 100

    async def upload_to_supabase(self, image_path):
        """Upload l'image vers Supabase"""
        # Ici, implémentez l'upload vers Supabase
        # Pour l'instant, retournons une URL de test
        return f"https://supabase.example.com/{os.path.basename(image_path)}"

    async def process_batch(self, batch_data, batch_number):
        """Traite un lot complet d'événements"""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for event in batch_data['events']:
                task = asyncio.create_task(
                    self.process_single_event(event, session, batch_number)
                )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, Exception):
                    logging.error(f"Erreur dans le lot {batch_number}: {result}")
                else:
                    self.report_manager.add_event_result(result)

    async def process_single_event(self, event, session, batch_number):
        """Traite un événement individuel"""
        start_time = time.time()
        
        try:
            # Vérification du contenu
            content_issues = self.check_content_policy(event)
            
            # Génération du prompt
            prompt = self.generate_prompt(event, content_issues)
            print(f"Traitement de l'événement : {event['titre']}")
            print(f"Prompt DALL-E généré : {prompt}")
            
            # Génération de l'image avec DALL-E
            image_url = await self.generate_dalle_image(prompt, session)
            
            # Téléchargement et traitement de l'image
            image_path = await self.download_and_process_image(
                image_url,
                event['id'],
                session
            )
            
            # Upload vers Supabase
            public_url = await self.upload_to_supabase(image_path)
            
            processing_time = time.time() - start_time
            
            return {
                'event_id': event['id'],
                'original_filename': event.get('titre', ''),
                'new_filename': os.path.basename(image_path),
                'public_url': public_url,
                'status': 'success',
                'prompt_used': prompt,
                'content_issues': content_issues,
                'processing_time': processing_time,
                'batch_number': batch_number,
                'original_size': os.path.getsize(image_path),
                'compressed_size': os.path.getsize(image_path.replace('.jpg', '.webp')),
                'compression_ratio': self.calculate_compression_ratio(image_path)
            }
            
        except Exception as e:
            logging.error(f"Erreur lors du traitement de l'événement {event['id']}: {e}")
            return {
                'event_id': event['id'],
                'status': 'error',
                'error_message': str(e),
                'batch_number': batch_number
            }

async def main():
    # Initialisation
    config_manager = ConfigManager()
    processor = DALLEProcessor(config_manager)
    
    try:
        # Charger le CSV des événements
        events_df = pd.read_csv('evenements.csv')
        
        # Traiter les événements
        await processor.process_events(events_df)
        
        # Générer les rapports
        reports = processor.report_manager.generate_reports()
        logging.info(f"Traitement terminé. Rapports disponibles dans: {reports['main']}")
        
    except Exception as e:
        logging.error(f"Erreur critique: {str(e)}")
        raise
    finally:
        processor.driver.quit()

if __name__ == "__main__":
    asyncio.run(main())