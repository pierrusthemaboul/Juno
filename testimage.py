from supabase import create_client, Client

# Configuration de Supabase
url: str = "https://ppxmtnuewcixbbmhnzzc.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U"
supabase: Client = create_client(url, key)

# Exemple d'appel à Supabase pour récupérer tous les événements
data = supabase.table("evenements").select("*").execute()
print(data)