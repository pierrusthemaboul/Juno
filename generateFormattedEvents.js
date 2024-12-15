import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';

// Créer le client Supabase
const supabaseUrl = 'https://ppxmtnuewcixbbmhnzzc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Déterminer la période historique
function getPeriod(date: string): string {
    const year = parseInt(date.split('-')[0]);
    if (year < 476) return "ANTIQUITÉ";
    if (year < 1492) return "MOYEN ÂGE (476-1492)";
    if (year < 1789) return "ÉPOQUE MODERNE (1492-1789)";
    return "ÉPOQUE CONTEMPORAINE (1789-aujourd'hui)";
}

// Formater la date
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.getFullYear().toString();
}

async function generateFormattedEvents() {
    try {
        // Récupérer tous les événements, triés par date
        const { data: events, error } = await supabase
            .from('evenements')
            .select('*')
            .order('date');

        if (error) throw error;

        // Grouper par période
        const eventsByPeriod: { [key: string]: any[] } = {};
        events.forEach(event => {
            const period = getPeriod(event.date);
            if (!eventsByPeriod[period]) {
                eventsByPeriod[period] = [];
            }
            eventsByPeriod[period].push(event);
        });

        // Générer le contenu formaté
        let output = "# LISTE DES ÉVÉNEMENTS HISTORIQUES\n";
        output += "(Liste chronologique)\n\n";

        for (const period of Object.keys(eventsByPeriod)) {
            output += `## ${period}\n`;
            eventsByPeriod[period].forEach(event => {
                const date = formatDate(event.date);
                output += `- ${date} : ${event.titre}\n`;
            });
            output += "\n";
        }

        // Ajouter une note sur le nombre total d'événements
        output += `Note : Cette liste contient ${events.length} événements historiques.\n`;

        // Écrire dans un fichier
        await writeFile('./evenements_historiques.md', output);
        console.log('Fichier créé avec succès !');

    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Exécuter le script
generateFormattedEvents();