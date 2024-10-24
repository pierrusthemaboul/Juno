import os
import re
from supabase import create_client, Client
from fuzzywuzzy import fuzz

# Configuration Supabase
url: str = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

def find_best_matching_event(filename, events):
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

def upload_and_update(image_folder):
    try:
        response = supabase.table("evenements").select("*").execute()
        events = response.data
        print(f"Nombre d'événements récupérés de Supabase : {len(events)}")
    except Exception as e:
        print(f"Erreur lors de la récupération des événements : {str(e)}")
        return

    for filename in os.listdir(image_folder):
        if filename.endswith('.webp'):
            print(f"\nTraitement du fichier : {filename}")
            matching_event = find_best_matching_event(filename, events)

            if not matching_event:
                print(f"Attention : Aucun événement correspondant trouvé pour {filename}")
                continue

            file_path = os.path.join(image_folder, filename)

            try:
                with open(file_path, "rb") as file:
                    file_contents = file.read()

                # Ajout de logs pour vérifier ce que l'on upload
                print(f"Fichier prêt à être uploadé : {filename} - Taille : {len(file_contents)} octets")

                # Essai de l'upload avec plus de détails sur la réponse
                upload_response = supabase.storage.from_("evenements-image").upload(filename, file_contents, {"upsert": True})

                # Ajout d'un log pour afficher la réponse exacte de l'upload
                print(f"Réponse de l'upload : {upload_response}")

                # Vérification explicite de la réponse avant de continuer
                if isinstance(upload_response, dict) and 'data' in upload_response:
                    print(f"Fichier uploadé avec succès : {filename}")
                    
                    public_url = supabase.storage.from_("evenements-image").get_public_url(filename)
                    print(f"URL publique générée : {public_url}")

                    update_result = supabase.table("evenements").update({"illustration_url": public_url}).eq("id", matching_event['id']).execute()
                    
                    if hasattr(update_result, 'error') and update_result.error:
                        print(f"Erreur lors de la mise à jour de la base de données pour {filename}: {update_result.error}")
                    else:
                        print(f"Mise à jour réussie pour {filename}")

                    # Vérification supplémentaire de l'URL après mise à jour
                    verify_result = supabase.table("evenements").select("illustration_url").eq("id", matching_event['id']).execute()
                    if verify_result.data[0]['illustration_url'] != public_url:
                        print(f"ERREUR : L'URL pour {filename} ne correspond pas après la mise à jour!")
                    else:
                        print(f"Vérification réussie pour {filename}")
                else:
                    print(f"Erreur lors de l'upload de {filename}, réponse : {upload_response}")
            
            except Exception as e:
                print(f"Erreur lors du traitement de {filename}: {str(e)}")

if __name__ == "__main__":
    # Chemin absolu vers le dossier des images
    image_folder = '/home/pierre/Juno/assets/images/images_evenements'
    upload_and_update(image_folder)
