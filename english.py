from googletrans import Translator
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import time
from tqdm import tqdm
import urllib.parse

# Encodage du mot de passe pour l'URL
password = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
encoded_password = urllib.parse.quote_plus(password)

# Construction de l'URL de connexion
url = f"postgresql://postgres:{encoded_password}@ppxmtnuewcixbbmhnzzc.supabase.co:5432/postgres"

# Tentative de connexion à la base de données Supabase
try:
    engine = create_engine(url)
    with engine.connect() as connection:
        print("✅ Connexion réussie à la base de données Supabase.")
except OperationalError as e:
    print(f"❌ Erreur de connexion à la base de données: {str(e)}")
    exit()

# Récupérer les titres de la table
query = "SELECT id, titre FROM transitoire2 WHERE titre_anglais IS NULL;"
try:
    data = pd.read_sql(query, engine)
    print(f"📚 {len(data)} titres à traduire trouvés.")
except Exception as e:
    print(f"❌ Erreur lors de la récupération des données : {str(e)}")
    exit()

if len(data) == 0:
    print("✨ Rien à traduire, tous les titres ont déjà une traduction.")
    exit()

# Initialiser le traducteur
translator = Translator()
successful_translations = 0
failed_translations = 0

# Utilisation de tqdm pour la barre de progression
for index, row in tqdm(data.iterrows(), total=len(data), desc="🔄 Traduction en cours"):
    try:
        translated_title = translator.translate(row['titre'], src='fr', dest='en').text
        
        # Échapper les apostrophes pour éviter les erreurs SQL
        translated_title = translated_title.replace("'", "''")
        
        update_query = f"""
        UPDATE transitoire2
        SET titre_anglais = '{translated_title}'
        WHERE id = '{row['id']}';
        """
        with engine.connect() as conn:
            conn.execute(update_query)
        
        successful_translations += 1
        time.sleep(0.5)  # Petit délai pour éviter de surcharger l'API
        
    except Exception as e:
        print(f"\n❌ Erreur pour '{row['titre']}': {str(e)}")
        failed_translations += 1
        time.sleep(1)
        continue

print(f"\n✅ Traductions terminées !")
print(f"📊 Résultats :")
print(f"   ✓ {successful_translations} traductions réussies")
print(f"   ✗ {failed_translations} échecs")