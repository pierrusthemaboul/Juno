import requests
import time
import os
import logging
from slugify import slugify
from supabase import create_client, Client

# Configuration du logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Configuration RunPod
RUNPOD_API_KEY = "86SNMXJL18UX87W1AJA5B24NJ3UCGV5C6L5Q2EYF"
RUNPOD_ENDPOINT = "https://u1ktn24skmyux6-3001.proxy.runpod.net"  # Retiré '/run'

# Configuration Supabase
SUPABASE_URL = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Définir les événements (inchangé)
events = [
    {
        "titre": "Découverte de la tombe de Toutânkhamon",
        "prompt": "Peinture hyper-réaliste de la découverte de la tombe de Toutânkhamon, 4 novembre 1922. Vue intérieure de la chambre funéraire, éclairée par la lueur chaude des lampes à huile. Au centre, le sarcophage doré du pharaon, intact et étincelant. Howard Carter, l'archéologue, au premier plan, expression de stupéfaction et d'émerveillement sur son visage, main tendue vers le trésor."
    },
    # ... autres événements ...
]

def generate_image(prompt):
    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "input": {
            "prompt": prompt,
            "num_outputs": 1,
            "num_inference_steps": 50,
            "guidance_scale": 7.5,
            "width": 512,
            "height": 512
        }
    }
    
    logging.info(f"Sending request to: {RUNPOD_ENDPOINT}")
    logging.debug(f"Request headers: {headers}")
    logging.debug(f"Request data: {data}")
    
    try:
        response = requests.post(RUNPOD_ENDPOINT, headers=headers, json=data)
        logging.info(f"Response status code: {response.status_code}")
        logging.debug(f"Response content: {response.text}")
        
        if response.status_code == 404:
            logging.error("Error 404: The endpoint URL might be incorrect or the service is not available.")
            return None
        
        response_json = response.json()
        if 'id' not in response_json:
            logging.error("Error: 'id' not found in response")
            logging.debug(f"Full response: {response_json}")
            return None
        
        job_id = response_json['id']
        logging.info(f"Job ID received: {job_id}")
        
        # Attendre que la tâche soit terminée
        while True:
            status_url = f"{RUNPOD_ENDPOINT}/status/{job_id}"
            logging.info(f"Checking job status at: {status_url}")
            status_response = requests.get(status_url, headers=headers)
            status_json = status_response.json()
            logging.debug(f"Status response: {status_json}")
            if status_json.get('status') == 'COMPLETED':
                logging.info("Job completed successfully")
                return status_json.get('output', [None])[0]
            elif status_json.get('status') in ['FAILED', 'CANCELLED']:
                logging.error(f"Job failed or cancelled. Status: {status_json.get('status')}")
                return None
            time.sleep(5)
    
    except requests.exceptions.RequestException as e:
        logging.error(f"An error occurred while making the request: {e}")
        return None

# Fonction principale
def main():
    logging.info("Starting image generation process")
    for event in events:
        logging.info(f"Processing event: {event['titre']}")
        image_url = generate_image(event["prompt"])
        if image_url is None:
            logging.error(f"Failed to generate image for: {event['titre']}")
            continue
        
        logging.info(f"Image URL received: {image_url}")
        
        # Télécharger l'image
        try:
            response = requests.get(image_url)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to download image: {e}")
            continue
        
        filename = slugify(event["titre"]) + ".png"
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        logging.info(f"Image saved locally: {filename}")
        
        # Uploader sur Supabase
        try:
            with open(filename, "rb") as f:
                supabase.storage.from_("evenements-image").upload(filename, f)
            logging.info(f"Image uploaded to Supabase: {filename}")
        except Exception as e:
            logging.error(f"Failed to upload image to Supabase: {str(e)}")
        
        # Supprimer le fichier local après l'upload
        os.remove(filename)
        logging.info(f"Local file removed: {filename}")

    logging.info("All images have been processed.")

if __name__ == "__main__":
    main()