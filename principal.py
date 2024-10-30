import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from combined_processor import RateLimitedDALLEProcessor

async def process_all_batches(processor, start_batch=1):
    """Traite tous les lots de manière séquentielle"""
    processed_batches_dir = Path('processed_batches')
    results_dir = Path('results')
    results_dir.mkdir(exist_ok=True)

    # Liste tous les fichiers batch_XX.json
    batch_files = sorted([f for f in processed_batches_dir.glob('batch_*.json')])
    
    if not batch_files:
        print("Aucun fichier batch trouvé dans le dossier 'processed_batches'")
        return

    print(f"Trouvé {len(batch_files)} fichiers batch à traiter")

    for batch_file in batch_files:
        batch_number = int(batch_file.stem.split('_')[1])
        
        # Saute les lots jusqu'au lot de départ spécifié
        if batch_number < start_batch:
            continue

        print(f"\nTraitement du lot {batch_number}")
        
        # Vérifie si le lot a déjà été traité
        result_file = results_dir / f'results_batch_{batch_number:02d}.json'
        if result_file.exists():
            print(f"Le lot {batch_number} a déjà été traité, passage au suivant")
            continue

        try:
            # Chargement du lot
            with open(batch_file, 'r', encoding='utf-8') as f:
                batch_data = json.load(f)

            # Traitement du lot
            results = await processor.process_batch(batch_data['events'])
            
            # Sauvegarde des résultats
            await processor.save_results(
                results, 
                str(result_file)
            )
            
            print(f"Lot {batch_number} traité avec succès")
            
            # Petite pause entre les lots
            if batch_file != batch_files[-1]:
                print("Pause de 30 secondes avant le prochain lot...")
                await asyncio.sleep(30)

        except Exception as e:
            print(f"Erreur lors du traitement du lot {batch_number}: {str(e)}")
            # Continue avec le prochain lot même en cas d'erreur

async def main():
    # Chargement des variables d'environnement
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("La clé API DALL-E n'est pas définie dans le fichier .env")
    
    # Configuration Supabase
    supabase_url = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"

    # Initialisation du processeur
    processor = RateLimitedDALLEProcessor(
        api_key=api_key,
        supabase_url=supabase_url,
        supabase_key=supabase_key
    )
    
    try:
        # Vous pouvez spécifier le numéro de lot de départ ici
        # Par exemple, pour commencer au lot 5: await process_all_batches(processor, start_batch=5)
        await process_all_batches(processor, start_batch=5)  # commence au lot 5
        print("\nTraitement de tous les lots terminé avec succès!")
        
    except Exception as e:
        print(f"\nErreur critique lors du traitement: {str(e)}")
        raise
    finally:
        print("\nNettoyage des fichiers temporaires...")
        # Vous pourriez ajouter ici du code pour nettoyer les fichiers temporaires si nécessaire

if __name__ == "__main__":
    asyncio.run(main())