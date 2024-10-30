import os
from PIL import Image
import io
from supabase import create_client
import pandas as pd
from datetime import datetime
import re
import uuid
import logging
import time

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration initiale (à déplacer plus tard dans .env)
SUPABASE_URL = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
SOURCE_DIR = "/home/pierre/Images/histoire"
TEMP_DIR = "/home/pierre/Images/temp_compressed"
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload")
MAX_RETRIES = 3

def ensure_directories():
    """S'assure que les dossiers nécessaires existent."""
    for directory in [TEMP_DIR, UPLOAD_DIR]:
        if not os.path.exists(directory):
            logger.info(f"Création du dossier: {directory}")
            os.makedirs(directory)

def init_supabase():
    """Initialise et teste la connexion Supabase."""
    try:
        logger.info("Tentative d'initialisation de Supabase...")
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase initialisé avec succès")
        return supabase
    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation de Supabase: {str(e)}")
        raise

def upload_with_retry(supabase, file_path, new_filename):
    """Upload un fichier avec retry en cas d'échec."""
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"Tentative d'upload {attempt + 1}/{MAX_RETRIES}")
            
            with open(file_path, "rb") as f:
                file_contents = f.read()
            
            result = supabase.storage \
                .from_("evenements-image") \
                .upload(
                    path=new_filename,
                    file=file_contents,
                    file_options={"content-type": "image/webp"}
                )
            
            logger.info(f"Upload réussi à la tentative {attempt + 1}")
            return True
            
        except Exception as e:
            logger.warning(f"Échec de la tentative {attempt + 1}: {str(e)}")
            if attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                logger.info(f"Nouvelle tentative dans {wait_time} secondes...")
                time.sleep(wait_time)
            else:
                logger.error("Échec de toutes les tentatives d'upload")
                raise

def clean_filename(filename):
    """Nettoie et standardise le nom de fichier."""
    logger.debug(f"Nettoyage du nom de fichier: {filename}")
    name, ext = os.path.splitext(filename)
    clean_name = re.sub(r'[^\w\s-]', '', name.lower())
    clean_name = re.sub(r'[-\s]+', '_', clean_name)
    unique_id = str(uuid.uuid4())[:8]
    new_filename = f"{clean_name}_{unique_id}.webp"
    logger.debug(f"Nouveau nom de fichier: {new_filename}")
    return new_filename

def compress_image(input_path, output_path, max_size_kb=500):
    """Compresse l'image avec une qualité optimale."""
    logger.info(f"Compression de l'image: {input_path}")
    try:
        img = Image.open(input_path)
        original_size = os.path.getsize(input_path)
        logger.info(f"Taille originale: {original_size/1024:.2f}KB")
        
        if img.mode in ('RGBA', 'P'):
            logger.debug("Conversion en RGB")
            img = img.convert('RGB')
        
        max_dimension = 1200
        if max(img.size) > max_dimension:
            ratio = max_dimension / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            logger.debug(f"Redimensionnement: {img.size} -> {new_size}")
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        quality = 85
        while quality > 20:
            img.save(output_path, 'WEBP', quality=quality, optimize=True)
            new_size = os.path.getsize(output_path)
            logger.debug(f"Essai avec qualité {quality}: {new_size/1024:.2f}KB")
            if new_size <= max_size_kb * 1024:
                break
            quality -= 5
        
        final_size = os.path.getsize(output_path)
        compression_ratio = (1 - final_size/original_size) * 100
        logger.info(f"Compression terminée. Nouvelle taille: {final_size/1024:.2f}KB (réduction de {compression_ratio:.1f}%)")
        
    except Exception as e:
        logger.error(f"Erreur lors de la compression: {str(e)}")
        raise

def process_images():
    """Traite toutes les images et retourne les données pour le DataFrame."""
    logger.info("Début du traitement des images")
    
    ensure_directories()
    
    try:
        supabase = init_supabase()
    except Exception as e:
        logger.error("Impossible d'initialiser Supabase")
        return []

    processed_data = []
    total_files = len([f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.webp', '.jpg', '.jpeg', '.png'))])
    logger.info(f"Nombre total de fichiers à traiter: {total_files}")

    for idx, filename in enumerate(os.listdir(SOURCE_DIR), 1):
        if filename.lower().endswith(('.webp', '.jpg', '.jpeg', '.png')):
            logger.info(f"Traitement du fichier {idx}/{total_files}: {filename}")
            try:
                original_path = os.path.join(SOURCE_DIR, filename)
                new_filename = clean_filename(filename)
                compressed_path = os.path.join(TEMP_DIR, new_filename)
                
                compress_image(original_path, compressed_path)
                
                logger.info(f"Début de l'upload vers Supabase: {new_filename}")
                upload_success = upload_with_retry(supabase, compressed_path, new_filename)
                
                if upload_success:
                    public_url = f"{SUPABASE_URL}/storage/v1/object/public/evenements-image/{new_filename}"
                    logger.info(f"URL publique générée: {public_url}")
                    
                    processed_data.append({
                        "ancien_nom": filename,
                        "nouveau_nom": new_filename,
                        "url": public_url
                    })
                
            except Exception as e:
                logger.error(f"Erreur lors du traitement de {filename}: {str(e)}")
            
            finally:
                if os.path.exists(compressed_path):
                    logger.debug(f"Nettoyage du fichier temporaire: {compressed_path}")
                    os.remove(compressed_path)

    return processed_data

def main():
    """Fonction principale."""
    logger.info("=== Début du programme ===")
    
    try:
        processed_data = process_images()
        
        if processed_data:
            df = pd.DataFrame(processed_data)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = os.path.join(UPLOAD_DIR, f"upload_report_{timestamp}.csv")
            df.to_csv(output_file, index=False, encoding='utf-8')
            logger.info(f"Résultats exportés dans: {output_file}")
        else:
            logger.warning("Aucune donnée n'a été traitée")
        
        if os.path.exists(TEMP_DIR):
            logger.info("Nettoyage du dossier temporaire")
            try:
                os.rmdir(TEMP_DIR)
            except Exception as e:
                logger.error(f"Erreur lors du nettoyage du dossier temporaire: {str(e)}")
            
    except Exception as e:
        logger.error(f"Erreur critique: {str(e)}")
        raise
    finally:
        logger.info("=== Fin du programme ===")

if __name__ == "__main__":
    main()