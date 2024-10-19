import os
from supabase import create_client, Client
from datetime import datetime

SUPABASE_URL = 'https://ppxmtnuewcixbbmhnzzc.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjg5OTEyNywiZXhwIjoyMDQyNDc1MTI3fQ.Awhy_C5Qxb1lYn4CbJrvh6yWI5O6HBHD_W2Et85W0vQ'

def list_latest_images():
    print("Initialisation du client Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Client Supabase initialisé avec succès.")

    print("Récupération des fichiers du bucket 'evenements-image'...")
    try:
        response = supabase.storage.from_('evenements-image').list()
        print(f"Nombre total de fichiers trouvés : {len(response)}")

        # Trier les fichiers par date de création (du plus récent au plus ancien)
        sorted_files = sorted(response, key=lambda x: x['created_at'], reverse=True)

        # Filtrer pour ne garder que les images (basé sur l'extension de fichier)
        image_files = [f for f in sorted_files if f['name'].lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]

        # Prendre les 22 premières images
        latest_images = image_files[:30]

        print(f"Les 21 dernières images uploadées :")
        for file in latest_images:
            file_url = f"{SUPABASE_URL}/storage/v1/object/public/evenements-image/{file['name']}"
            created_at = datetime.fromisoformat(file['created_at'].replace('Z', '+00:00'))
            print(f"Nom: {file['name']}")
            print(f"URL: {file_url}")
            print(f"Date de création: {created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print("---")

    except Exception as e:
        print(f"Erreur lors de l'appel à l'API Supabase: {str(e)}")

if __name__ == "__main__":
    list_latest_images()