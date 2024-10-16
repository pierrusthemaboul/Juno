import os
import re
from supabase import create_client, Client
from fuzzywuzzy import fuzz

# Configuration Supabase
url: str = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

def sanitize_filename(filename):
    """Sanitize a filename to remove spaces and special characters."""
    return re.sub(r'[^\w\-_\.]', '_', filename.replace(' ', '_'))

def find_best_matching_event(filename, events):
    """Find the best matching event from Supabase for a given filename using fuzzy matching."""
    best_match = None
    best_score = 0
    lower_filename = filename.lower()

    for event in events:
        title_score = fuzz.partial_ratio(event['titre'].lower(), lower_filename)
        keyword_scores = [fuzz.partial_ratio(kw.lower(), lower_filename) for kw in event.get('mots_cles', [])]
        score = max([title_score] + keyword_scores)

        if score > best_score:
            best_score = score
            best_match = event

    return best_match if best_score > 60 else None

def rename_images(image_folder):
    print(f"Démarrage du processus de renommage dans le dossier : {image_folder}")
    
    if not os.path.exists(image_folder):
        print(f"Le dossier {image_folder} n'existe pas.")
        return

    try:
        response = supabase.table("evenements").select("*").execute()
        events = response.data
        print(f"Nombre d'événements récupérés de Supabase : {len(events)}")
    except Exception as e:
        print(f"Erreur lors de la récupération des événements : {str(e)}")
        return

    renamed_count = 0
    skipped_count = 0
    error_count = 0
    
    for filename in os.listdir(image_folder):
        if filename.endswith(('.png', '.jpg', '.webp')):
            print(f"\nTraitement du fichier : {filename}")
            matching_event = find_best_matching_event(filename, events)
            
            if matching_event:
                # Crée un nom de fichier propre et court basé sur la date et le titre de l'événement
                new_filename = f"{matching_event['date']}_{sanitize_filename(matching_event['titre'])}.webp"
                old_path = os.path.join(image_folder, filename)
                new_path = os.path.join(image_folder, new_filename)
                
                try:
                    if filename != new_filename:
                        os.rename(old_path, new_path)
                        print(f"Renommé : {filename} -> {new_filename}")
                        renamed_count += 1
                    else:
                        print(f"Le fichier {filename} a déjà le bon format de nom")
                        skipped_count += 1
                except Exception as e:
                    print(f"Erreur lors du renommage de {filename} : {str(e)}")
                    error_count += 1
            else:
                print(f"Aucun événement correspondant trouvé pour {filename}")
                skipped_count += 1

    print(f"\nRésumé :")
    print(f"Nombre total de fichiers renommés : {renamed_count}")
    print(f"Nombre de fichiers ignorés ou déjà correctement nommés : {skipped_count}")
    print(f"Nombre d'erreurs rencontrées : {error_count}")

if __name__ == "__main__":
    # Utilisation du chemin absolu pour éviter les erreurs de chemin relatif
    image_folder = '/home/pierre/Juno/assets/images/images_evenements'  # Remplace par le bon chemin absolu si nécessaire
    rename_images(image_folder)
