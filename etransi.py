import spacy
from supabase import create_client, Client
import os
import re
from unidecode import unidecode
from fuzzywuzzy import fuzz
import logging
from pathlib import Path

# Chargement du modèle spaCy
nlp = spacy.load("en_core_web_md")

# Configuration du logging
log_dir = Path(__file__).parent / "logs"
log_dir.mkdir(exist_ok=True)
logging.basicConfig(filename=log_dir / 'event_matching.log', level=logging.INFO, 
                    format='%(asctime)s - %(message)s', datefmt='%d-%b-%y %H:%M:%S')

# Configuration Supabase
url = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

# Chemin vers le dossier contenant les images
image_folder = "/home/pierre/Images/histoire"

def normalize_string(s):
    s = re.sub(r'[_-]', ' ', s)
    s = re.sub(r'\.[^.]+$', '', s)
    s = re.sub(r'[^a-zA-Z\s]', '', s)
    return unidecode(s.lower().strip())

def extract_keywords(s):
    normalized = normalize_string(s)
    doc = nlp(normalized)
    return [token.lemma_ for token in doc if not token.is_stop and token.is_alpha and len(token) > 2]

def find_matching_event(filename, events):
    filename_keywords = extract_keywords(filename)
    print(f"Mots-clés extraits du nom de fichier: {', '.join(filename_keywords)}")
    
    matches = []
    
    for event in events:
        event_keywords = event['keywords_anglais']
        if not event_keywords:
            continue  # Ignorer les événements sans keywords
        
        # Calculer le score de correspondance des mots-clés
        keyword_score = fuzz.token_set_ratio(' '.join(filename_keywords), ' '.join(event_keywords))
        
        matches.append((event, keyword_score))
    
    matches.sort(key=lambda x: x[1], reverse=True)
    
    print("\nTop 3 correspondances:")
    for event, score in matches[:3]:
        print(f"Titre: {event['titre_anglais']}")
        print(f"Score: {score}")
        print(f"Keywords: {event['keywords_anglais']}")
        print()
    
    if matches and matches[0][1] > 20:  # Seuil abaissé à 20
        return matches[0][0]
    return None

def upload_image(file_path, event_filename):
    with open(file_path, "rb") as image_file:
        try:
            response = supabase.storage.from_("evenements-image").upload(event_filename, image_file)
            if response:
                public_url = f"https://ppxmtnuewcixbbmhnzzc.supabase.co/storage/v1/object/public/evenements-image/{event_filename}"
                return public_url
            else:
                print(f"Erreur lors de l'upload de l'image: {response}")
                logging.error(f"Erreur lors de l'upload de l'image: {response}")
                return None
        except Exception as e:
            print(f"Erreur lors de l'upload de l'image: {str(e)}")
            logging.error(f"Erreur lors de l'upload de l'image: {str(e)}")
            return None

def update_event_with_image(event_id, image_url):
    response = supabase.table("transitoire").update({"illustration_url": image_url}).eq("id", event_id).execute()
    if response.data:
        print(f"Événement transitoire {event_id} mis à jour avec l'URL de l'image")
        logging.info(f"Événement transitoire {event_id} mis à jour avec l'URL de l'image")
    else:
        print(f"Erreur lors de la mise à jour de l'événement transitoire: {response}")
        logging.error(f"Erreur lors de la mise à jour de l'événement transitoire: {response}")

# Récupération des événements en attente d'illustration de Supabase
response = supabase.table("transitoire").select("id", "keywords_anglais", "titre_anglais").eq("illustration_url", "attente").execute()
events_waiting_illustration = [event for event in response.data if event['keywords_anglais']]

print(f"Nombre d'événements transitoires en attente d'illustration avec des keywords : {len(events_waiting_illustration)}")

# Boucle principale
for filename in os.listdir(image_folder):
    if filename.endswith(('.webp', '.jpg', '.png')):
        full_path = os.path.join(image_folder, filename)
        
        print(f"\nTraitement de l'image : {filename}")
        matching_event = find_matching_event(filename, events_waiting_illustration)
        
        if matching_event:
            print(f"\nMeilleure correspondance trouvée :")
            print(f"Titre (EN): {matching_event['titre_anglais']}")
            print(f"Keywords: {matching_event['keywords_anglais']}")
            confirmation = input("Cette correspondance est-elle correcte ? (o/n): ")
            
            if confirmation.lower() == 'o':
                image_url = upload_image(full_path, filename)
                if image_url:
                    update_event_with_image(matching_event['id'], image_url)
                print(f"Image {filename} associée à l'événement transitoire")
            else:
                print(f"Association non confirmée pour {filename}")
        else:
            print(f"\nAucun événement transitoire correspondant trouvé au-dessus du seuil pour {filename}")
            manual_input = input("Voulez-vous entrer manuellement les mots-clés ? (o/n) : ")
            if manual_input.lower() == 'o':
                search_terms = input("Entrez les mots-clés en anglais séparés par des espaces : ")
                manual_matching_event = find_matching_event(search_terms, events_waiting_illustration)
                if manual_matching_event:
                    print(f"Correspondance trouvée :")
                    print(f"Titre (EN): {manual_matching_event['titre_anglais']}")
                    print(f"Keywords: {manual_matching_event['keywords_anglais']}")
                    confirmation = input("Cette correspondance est-elle correcte ? (o/n): ")
                    if confirmation.lower() == 'o':
                        image_url = upload_image(full_path, filename)
                        if image_url:
                            update_event_with_image(manual_matching_event['id'], image_url)
                        print(f"Image {filename} associée à l'événement transitoire")
                else:
                    print("Aucune correspondance trouvée avec les mots-clés fournis.")

print("Traitement terminé.")