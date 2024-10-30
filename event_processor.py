import pandas as pd
import asyncio
import json
from pathlib import Path

class EventBatchProcessor:
    def __init__(self, csv_path, batch_size=25):
        self.csv_path = csv_path
        self.batch_size = batch_size
        self.output_dir = Path('processed_batches')
        self.output_dir.mkdir(exist_ok=True)

    def load_and_prepare_data(self):
        """Charge et prépare les données du CSV"""
        df = pd.read_csv(self.csv_path)
        
        # Au lieu de convertir en datetime, on garde le format texte
        # et on trie en tant que chaînes de caractères
        df = df.sort_values('date', key=lambda x: [
            # Gestion des dates négatives (avant JC)
            int(d.split('-')[0]) if d.split('-')[0] != '' else -9999
            for d in x
        ])
        return df

    def create_batches(self, df):
        """Divise les données en lots"""
        total_events = len(df)
        batches = []
        
        for i in range(0, total_events, self.batch_size):
            batch_df = df.iloc[i:i + self.batch_size]
            batch_number = (i // self.batch_size) + 1
            
            batch_info = {
                'batch_number': batch_number,
                'events': []
            }
            
            for _, row in batch_df.iterrows():
                event_info = {
                    'id': row['id'],
                    'date': row['date'],
                    'titre': row['titre'],
                    'titre_anglais': row['titre_anglais'],
                    'epoque': row['epoque'],
                    'types_evenement': json.loads(row['types_evenement'].replace("'", '"'))
                }
                batch_info['events'].append(event_info)
            
            batches.append(batch_info)
            
            # Sauvegarde chaque lot dans un fichier JSON
            output_file = self.output_dir / f'batch_{batch_number:02d}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(batch_info, f, ensure_ascii=False, indent=2)
        
        return batches

    def generate_dalle_prompt(self, event):
        """Génère un prompt DALL-E approprié pour chaque événement"""
        base_prompt = f"Historical scene depicting {event['titre_anglais']} in {event['epoque']} era. "
        
        # Ajout du contexte basé sur les types d'événement
        event_types = ', '.join(event['types_evenement'])
        base_prompt += f"{event_types} scene, "
        
        # Ajout des instructions standard pour DALL-E
        base_prompt += "Detailed and historically accurate representation. No text in the image."
        
        return base_prompt

    async def process_event(self, event):
        """Traite un événement individuel"""
        prompt = self.generate_dalle_prompt(event)
        print(f"Traitement de l'événement : {event['titre']}")
        print(f"Prompt DALL-E généré : {prompt}")
        # Ici, vous ajouterez l'appel à l'API DALL-E
        return {
            'event_id': event['id'],
            'prompt': prompt,
            'status': 'prepared'
        }

    async def process_batch(self, batch):
        """Traite un lot complet d'événements"""
        tasks = []
        for event in batch['events']:
            task = asyncio.create_task(self.process_event(event))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return {
            'batch_number': batch['batch_number'],
            'results': results
        }

async def main():
    processor = EventBatchProcessor('dateuni.csv')
    print("Chargement des données...")
    df = processor.load_and_prepare_data()
    print("Création des lots...")
    batches = processor.create_batches(df)
    
    print(f"Nombre total de lots créés : {len(batches)}")
    
    # Traitement de chaque lot
    for batch in batches:
        print(f"\nTraitement du lot {batch['batch_number']}...")
        result = await processor.process_batch(batch)
        print(f"Lot {result['batch_number']} traité avec {len(result['results'])} événements")

if __name__ == "__main__":
    asyncio.run(main())