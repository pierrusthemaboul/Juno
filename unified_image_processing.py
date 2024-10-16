import os
import re
import shutil
import urllib.parse
from supabase import create_client, Client
from fuzzywuzzy import fuzz
import logging

# Configuration du logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Configuration Supabase
url: str = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

def clean_filename(filename):
    # Remplacer les caractères accentués
    filename = re.sub(r'[àáâãäå]', 'a', filename)
    filename = re.sub(r'[èéêë]', 'e', filename)
    filename = re.sub(r'[ìíîï]', 'i', filename)
    filename = re.sub(r'[òóôõö]', 'o', filename)
    filename = re.sub(r'[ùúûü]', 'u', filename)
    filename = re.sub(r'[ýÿ]', 'y', filename)
    filename = re.sub(r'[ñ]', 'n', filename)
    filename = re.sub(r'[ç]', 'c', filename)
    
    # Remplacer les espaces par des underscores
    filename = filename.replace(' ', '_')
    
    # Supprimer tous les caractères non alphanumériques (sauf underscore et point)
    filename = re.sub(r'[^a-zA-Z0-9_.]', '', filename)
    
    return filename

def connect_to_supabase():
    try:
        response = supabase.table("evenements").select("id").limit(1).execute()
        logging.info("Connexion à Supabase établie avec succès.")
        return supabase
    except Exception as e:
        logging.error(f"Erreur lors de la connexion à Supabase: {str(e)}")
        raise

def get_events_data():
    try:
        response = supabase.table("evenements").select("*").execute()
        logging.info(f"Récupération de {len(response.data)} événements depuis Supabase.")
        return response.data
    except Exception as e:
        logging.error(f"Erreur lors de la récupération des événements: {str(e)}")
        raise

def create_image_event_mapping(dalle_filename, event_id):
    try:
        data = {
            "dalle_filename": dalle_filename,
            "event_id": event_id,
            "status": "pending"
        }
        response = supabase.table("image_event_mapping").insert(data).execute()
        logging.info(f"Mapping créé pour {dalle_filename} avec l'événement {event_id}")
        return response.data
    except Exception as e:
        logging.error(f"Erreur lors de la création du mapping: {str(e)}")
        raise

def rename_image(image_folder, dalle_filename, event_data):
    try:
        new_filename = f"{event_data['date']}_{clean_filename(event_data['titre'])}.webp"
        old_path = os.path.join(image_folder, dalle_filename)
        new_path = os.path.join(image_folder, new_filename)
        shutil.move(old_path, new_path)
        logging.info(f"Image renommée: {dalle_filename} -> {new_filename}")
        return new_filename
    except Exception as e:
        logging.error(f"Erreur lors du renommage de l'image: {str(e)}")
        raise

def upload_image_to_supabase(image_folder, filename):
    try:
        file_path = os.path.join(image_folder, filename)
        logging.debug(f"Tentative d'upload du fichier: {file_path}")
        with open(file_path, "rb") as file:
            file_contents = file.read()
        cleaned_filename = clean_filename(filename)
        response = supabase.storage.from_("evenements-image").upload(cleaned_filename, file_contents)
        if isinstance(response, dict) and 'path' in response:
            public_url = supabase.storage.from_("evenements-image").get_public_url(response['path'])
            logging.info(f"Image uploadée: {filename}, URL: {public_url}")
            return public_url
        else:
            raise ValueError(f"Réponse inattendue de Supabase lors de l'upload: {response}")
    except Exception as e:
        logging.error(f"Erreur lors de l'upload de l'image: {str(e)}")
        raise

def update_event_illustration_url(event_id, public_url):
    try:
        response = supabase.table("evenements").update({"illustration_url": public_url}).eq("id", event_id).execute()
        if len(response.data) > 0:
            logging.info(f"URL de l'illustration mise à jour pour l'événement {event_id}: {public_url}")
        else:
            logging.warning(f"Aucune mise à jour effectuée pour l'événement {event_id}")
    except Exception as e:
        logging.error(f"Erreur lors de la mise à jour de l'URL de l'illustration: {str(e)}")
        raise

def find_best_matching_event(filename, events):
    best_match = None
    best_score = 0
    lower_filename = filename.lower()
    
    logging.info(f"Recherche de correspondance pour le fichier: {filename}")
    
    for event in events:
        title_score = fuzz.partial_ratio(event['titre'].lower(), lower_filename)
        keyword_scores = [fuzz.partial_ratio(kw.lower(), lower_filename) for kw in event.get('mots_cles', [])] if event.get('mots_cles') else []
        date_score = fuzz.partial_ratio(str(event['date']), lower_filename)
        
        score = max([title_score, date_score] + keyword_scores)
        
        logging.debug(f"Événement: {event['titre']}, Date: {event['date']}, Score: {score}")
        logging.debug(f"  Titre score: {title_score}, Date score: {date_score}, Mots-clés scores: {keyword_scores}")
        
        if score > best_score:
            best_score = score
            best_match = event

    if best_match and best_score > 50:  # Abaissé le seuil à 50
        logging.info(f"Meilleure correspondance trouvée: {best_match['titre']} avec un score de {best_score}")
        return best_match
    else:
        logging.warning(f"Aucune correspondance satisfaisante trouvée. Meilleur score: {best_score}")
        return None

def process_images(image_folder):
    try:
        supabase_client = connect_to_supabase()
        events = get_events_data()

        logging.info(f"Contenu du dossier {image_folder}:")
        for filename in os.listdir(image_folder):
            logging.info(f"  - {filename}")
            if filename.endswith('.webp'):
                logging.info(f"    Cette image sera traitée")
            else:
                logging.info(f"    Cette image ne sera pas traitée")

        for filename in os.listdir(image_folder):
            logging.info(f"Examen du fichier : {filename}")
            if filename.endswith('.webp'):
                logging.info(f"Traitement de l'image: {filename}")
                
                try:
                    mapping = supabase.table("image_event_mapping").select("*").eq("dalle_filename", filename).execute()
                    logging.info(f"Résultat de la recherche de mapping: {mapping.data}")
                    
                    if not mapping.data:
                        matching_event = find_best_matching_event(filename, events)
                        if matching_event:
                            logging.info(f"Événement correspondant trouvé: {matching_event['titre']}")
                            create_image_event_mapping(filename, matching_event['id'])
                        else:
                            logging.warning(f"Aucun événement correspondant trouvé pour {filename}")
                            continue
                    
                    pending_images = supabase.table("image_event_mapping").select("*").eq("status", "pending").execute()
                    logging.info(f"Images en attente: {len(pending_images.data)}")
                    
                    for mapping in pending_images.data:
                        event = next((e for e in events if e['id'] == mapping['event_id']), None)
                        if event:
                            try:
                                new_filename = rename_image(image_folder, mapping['dalle_filename'], event)
                                supabase.table("image_event_mapping").update({"status": "renamed", "dalle_filename": new_filename}).eq("id", mapping['id']).execute()
                                logging.info(f"Image renommée et mapping mis à jour: {mapping['dalle_filename']} -> {new_filename}")
                            except Exception as e:
                                logging.error(f"Erreur lors du renommage de {mapping['dalle_filename']}: {str(e)}")
                    
                    renamed_images = supabase.table("image_event_mapping").select("*").eq("status", "renamed").execute()
                    logging.info(f"Images renommées à uploader: {len(renamed_images.data)}")
                    
                    for mapping in renamed_images.data:
                        try:
                            public_url = upload_image_to_supabase(image_folder, mapping['dalle_filename'])
                            supabase.table("image_event_mapping").update({"status": "uploaded"}).eq("id", mapping['id']).execute()
                            logging.info(f"Image uploadée: {mapping['dalle_filename']}")
                            
                            update_event_illustration_url(mapping['event_id'], public_url)
                            supabase.table("image_event_mapping").update({"status": "completed"}).eq("id", mapping['id']).execute()
                            logging.info(f"URL mise à jour pour l'événement {mapping['event_id']}")
                        except Exception as e:
                            logging.error(f"Erreur lors de l'upload ou de la mise à jour de {mapping['dalle_filename']}: {str(e)}")
                
                except Exception as e:
                    logging.error(f"Erreur lors du traitement de {filename}: {str(e)}")
            else:
                logging.info(f"Fichier ignoré : {filename}")

        logging.info("Traitement des images terminé.")
    except Exception as e:
        logging.error(f"Erreur générale lors du traitement des images: {str(e)}")

if __name__ == "__main__":
    image_folder = '/home/pierre/Juno/assets/images/images_evenements'
    process_images(image_folder)