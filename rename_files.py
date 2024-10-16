import os
import re
import uuid
import unicodedata

def clean_filename(filename):
    # Sépare le nom du fichier et l'extension
    name, ext = os.path.splitext(filename)
    
    # Supprime le préfixe "DALL·E" et la date
    name = re.sub(r'^DALL·E \d{4}-\d{2}-\d{2} \d{2}\.\d{2}\.\d{2} - ', '', name)
    
    # Convertit en ASCII, supprime les accents
    name = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('ASCII')
    
    # Remplace les caractères non alphanumériques par des tirets bas
    clean_name = re.sub(r'[^\w]', '_', name)
    
    # Supprime les tirets bas multiples
    clean_name = re.sub(r'_+', '_', clean_name)
    
    # Supprime les tirets bas au début et à la fin
    clean_name = clean_name.strip('_')
    
    # Convertit en minuscules
    clean_name = clean_name.lower()
    
    # Limite la longueur du nom de fichier (en gardant de la place pour l'ID unique et l'extension)
    max_length = 100 - 9 - len(ext)  # 9 pour l'ID unique et le tiret bas
    clean_name = clean_name[:max_length]
    
    # Ajoute un identifiant unique court
    unique_id = str(uuid.uuid4())[:8]
    
    # Reconstruit le nom de fichier avec l'extension
    return f"{clean_name}_{unique_id}{ext}"

def rename_files_in_directory(directory):
    # Liste tous les fichiers dans le répertoire
    files = os.listdir(directory)

    # Parcours chaque fichier et renomme
    for filename in files:
        # Ignore les fichiers cachés (commençant par un point)
        if filename.startswith('.'):
            continue
        
        old_file = os.path.join(directory, filename)
        clean_name = clean_filename(filename)
        new_file = os.path.join(directory, clean_name)

        if old_file != new_file:
            os.rename(old_file, new_file)
            print(f"Renommé : {filename} -> {clean_name}")

# Exécute la fonction avec le chemin vers ton répertoire
directory_path = '/home/pierre/Images/histoire'
rename_files_in_directory(directory_path)