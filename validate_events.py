import os
from supabase import create_client, Client
import requests
from fuzzywuzzy import fuzz
from datetime import datetime

# Configuration Supabase
url: str = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

def get_events_from_supabase():
    response = supabase.table("evenements").select("id", "titre", "date", "mots_cles", "titre_anglais", "keywords_anglais", "epoque", "types_evenement", "pays").execute()
    return response.data

def query_wikidata(event):
    url = "https://www.wikidata.org/w/api.php"
    params = {
        "action": "wbsearchentities",
        "format": "json",
        "language": "fr",
        "type": "item",
        "search": event['titre'],
        "limit": 50
    }
    response = requests.get(url, params=params)
    return response.json()

def get_wikidata_details(entity_id):
    url = "https://www.wikidata.org/w/api.php"
    params = {
        "action": "wbgetentities",
        "format": "json",
        "ids": entity_id,
        "languages": "fr|en",
        "props": "labels|claims|descriptions"
    }
    response = requests.get(url, params=params)
    return response.json()

def parse_wikidata_date(entity):
    date_properties = ['P585', 'P580', 'P582']
    for prop in date_properties:
        if prop in entity['claims']:
            date_claim = entity['claims'][prop]
            if date_claim and 'datavalue' in date_claim[0]['mainsnak']:
                date_string = date_claim[0]['mainsnak']['datavalue']['value']['time']
                date_string = date_string[1:]  # Enlever le '+' au début
                if date_string.endswith('-00-00'):
                    return datetime.strptime(date_string[:4], "%Y").date()
                elif date_string.endswith('-00'):
                    return datetime.strptime(date_string[:7], "%Y-%m").date()
                else:
                    return datetime.strptime(date_string[:10], "%Y-%m-%d").date()
    return None

def calculate_similarity_score(event, entity):
    score = 0
    if 'labels' in entity:
        if 'fr' in entity['labels']:
            score += fuzz.ratio(event['titre'], entity['labels']['fr']['value'])
        if 'en' in entity['labels'] and event['titre_anglais']:
            score += fuzz.ratio(event['titre_anglais'], entity['labels']['en']['value'])
    
    if 'descriptions' in entity:
        if 'fr' in entity['descriptions']:
            score += sum(fuzz.partial_ratio(keyword, entity['descriptions']['fr']['value']) for keyword in event['mots_cles'])
        if 'en' in entity['descriptions'] and event['keywords_anglais']:
            score += sum(fuzz.partial_ratio(keyword, entity['descriptions']['en']['value']) for keyword in event['keywords_anglais'])
    
    return score / 2  # Normaliser le score

def validate_events():
    events = get_events_from_supabase()
    validated_events = []
    inconsistent_events = []

    for event in events:
        print(f"Validation de l'événement : {event['titre']}")
        wikidata_results = query_wikidata(event)
        
        if wikidata_results['search']:
            best_match = None
            best_score = 0
            for result in wikidata_results['search']:
                entity_details = get_wikidata_details(result['id'])
                if entity_details['entities']:
                    entity = entity_details['entities'][result['id']]
                    similarity_score = calculate_similarity_score(event, entity)
                    if similarity_score > best_score:
                        best_score = similarity_score
                        best_match = entity

            if best_match and best_score >= 70:
                wikidata_date = parse_wikidata_date(best_match)
                
                if wikidata_date:
                    event_date = datetime.strptime(event['date'], "%Y-%m-%d").date()
                    if event_date.year == wikidata_date.year:
                        validated_events.append(event)
                    else:
                        inconsistent_events.append((event, f"Date inconsistante : Base de données {event_date.year}, Wikidata {wikidata_date.year}"))
                else:
                    inconsistent_events.append((event, "Pas de date trouvée sur Wikidata"))
            else:
                inconsistent_events.append((event, f"Meilleure correspondance : '{best_match['labels']['fr']['value'] if best_match else 'Aucune'}' (score: {best_score})"))
        else:
            inconsistent_events.append((event, "Aucun résultat trouvé sur Wikidata"))

    print("\nRapport de validation:")
    print("\nÉvénements validés:")
    for event in validated_events:
        print(f"- {event['titre']} ({event['date']})")

    print("\nÉvénements avec des incohérences:")
    for event, reason in inconsistent_events:
        print(f"- {event['titre']} ({event['date']}): {reason}")

if __name__ == "__main__":
    validate_events()