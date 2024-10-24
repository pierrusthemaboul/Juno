import os
import re
from fuzzywuzzy import fuzz  # Importation de fuzzywuzzy pour la correspondance floue
from supabase import create_client, Client
# Initialisation de la connexion à Supabase
url = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

# Fonction pour normaliser les noms de fichiers
def normaliser_nom_fichier(nom):
    nom_sans_espaces = re.sub(r'\s+', ' ', nom)  # Remplace plusieurs espaces par un seul
    nom_sans_points = nom_sans_espaces.replace('.', '').replace(' ', '_')  # Supprime les points et remplace les espaces par _
    return nom_sans_points.lower()

# Récupération des données depuis la table 'gpt3' (titre_anglais ajouté)
data = supabase.table('gpt3').select('uuid', 'titre_anglais', 'nouveau_nom', 'ancien_nom').execute()
evenements = data.data

# Liste des fichiers présents dans le répertoire local
repertoire_images = '/home/pierre/Images/hist'
fichiers_presents = os.listdir(repertoire_images)

# Normalisation des noms de fichiers présents
fichiers_normalises = {normaliser_nom_fichier(f): f for f in fichiers_presents}
print("Fichiers normalisés dans le répertoire :")
for fichier_normalise, fichier_original in fichiers_normalises.items():
    print(f"Normalisé : {fichier_normalise} -> Original : {fichier_original}")

# Traitement de chaque événement
for evenement in evenements:
    titre_anglais = evenement['titre_anglais']
    ancien_nom = evenement['ancien_nom']
    nouveau_nom = evenement['nouveau_nom']

    # Normalisation du titre anglais pour la recherche
    nom_normalise = normaliser_nom_fichier(titre_anglais)
    print(f"\nTraitement de l'événement : {titre_anglais}")

    # Recherche du fichier correspondant
    fichier_correspondant = None
    meilleure_correspondance = None
    meilleur_score = 0

    for fichier_normalise, fichier_original in fichiers_normalises.items():
        score = fuzz.ratio(nom_normalise, fichier_normalise)
        if score > meilleur_score:
            meilleur_score = score
            meilleure_correspondance = fichier_original

    # Vérification si la correspondance est acceptable
    if meilleure_correspondance and meilleur_score >= 40:  # On accepte les correspondances avec un score >= 75%
        fichier_correspondant = meilleure_correspondance
        print(f"Fichier trouvé avec {meilleur_score}% de correspondance : {fichier_correspondant}")

        # Renommage du fichier en fonction du nouveau nom proposé
        ancien_chemin = os.path.join(repertoire_images, fichier_correspondant)
        nouveau_chemin = os.path.join(repertoire_images, nouveau_nom)

        os.rename(ancien_chemin, nouveau_chemin)
        print(f"Fichier renommé : {nouveau_nom}")

        # Lecture du fichier
        with open(nouveau_chemin, 'rb') as file_data:
            # Upload du fichier dans Supabase
            upload_response = supabase.storage().from_('evenements-image').upload(f'images/{nouveau_nom}', file_data)
            print(f"Fichier {nouveau_nom} uploadé avec succès dans Supabase.")
    else:
        print(f"Aucune correspondance acceptable pour {titre_anglais} (meilleure correspondance : {meilleure_correspondance}, score : {meilleur_score}%)")

print("Traitement terminé.")
