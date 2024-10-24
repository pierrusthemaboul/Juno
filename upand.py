import os
from supabase import create_client, Client
from datetime import datetime

SUPABASE_URL = 'https://ppxmtnuewcixbbmhnzzc.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg5OTEyNywiZXhwIjoyMDQyNDc1MTI3fQ.Awhy_C5Qxb1lYn4CbJrvh6yWI5O6HBHD_W2Et85W0vQ'

# Dossier local des images à uploader
LOCAL_IMAGE_DIR = '/home/pierre/Images/histoire'

def upload_images():
    print("Initialisation du client Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Client Supabase initialisé avec succès.")

    # Vérifier si le dossier d'images existe
    if not os.path.exists(LOCAL_IMAGE_DIR):
        print(f"Le dossier {LOCAL_IMAGE_DIR} n'existe pas.")
        return

    # Récupérer la liste des fichiers dans le dossier local
    images_to_upload = [f for f in os.listdir(LOCAL_IMAGE_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]

    if not images_to_upload:
        print(f"Aucune image trouvée dans le dossier {LOCAL_IMAGE_DIR}.")
        return

    print(f"Nombre d'images à uploader : {len(images_to_upload)}")

    # Uploader chaque fichier vers le bucket 'evenements-image'
    uploaded_images = []
    for image in images_to_upload:
        image_path = os.path.join(LOCAL_IMAGE_DIR, image)
        with open(image_path, 'rb') as file_data:
            try:
                response = supabase.storage.from_('evenements-image').upload(f"{image}", file_data.read())
                uploaded_images.append(image)
                print(f"Image {image} uploadée avec succès.")
            except Exception as e:
                print(f"Erreur lors de l'upload de {image} : {str(e)}")

    return uploaded_images


def list_latest_uploaded_images(uploaded_images):
    print("Récupération des fichiers du bucket 'evenements-image'...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        response = supabase.storage.from_('evenements-image').list()
        sorted_files = sorted(response, key=lambda x: x['created_at'], reverse=True)

        # Afficher les fichiers récemment uploadés
        print("Les fichiers récemment uploadés :")
        for file in sorted_files:
            if file['name'] in uploaded_images:
                file_url = f"{SUPABASE_URL}/storage/v1/object/public/evenements-image/{file['name']}"
                created_at = datetime.fromisoformat(file['created_at'].replace('Z', '+00:00'))
                print(f"Nom: {file['name']}")
                print(f"URL: {file_url}")
                print(f"Date de création: {created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                print("---")

    except Exception as e:
        print(f"Erreur lors de l'appel à l'API Supabase: {str(e)}")


if __name__ == "__main__":
    uploaded_images = upload_images()
    if uploaded_images:
        list_latest_uploaded_images(uploaded_images)
