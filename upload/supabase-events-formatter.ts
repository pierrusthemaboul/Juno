import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';

const supabaseUrl = 'https://ppxmtnuewcixbbmhnzzc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Event {
    date: string;
    titre: string;
    niveau_difficulte: number;
    types_evenement?: string[];
    universel?: boolean;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.getFullYear().toString();
}

function getMainTheme(event: Event): string {
    if (!event.types_evenement || event.types_evenement.length === 0) {
        return "Autres";
    }

    const typeMapping: { [key: string]: string } = {
        'Militaire': 'Guerres et Conflits',
        'Politique': 'Politique et Société',
        'Science': 'Science et Découvertes',
        'Technologie': 'Innovations Technologiques',
        'Culturel': 'Culture et Arts',
        'Social': 'Politique et Société',
        'Économie': 'Économie et Commerce'
    };

    const mainType = event.types_evenement[0];
    return typeMapping[mainType] || 'Autres';
}

function isMajorEvent(event: Event): boolean {
    return event.niveau_difficulte >= 7 || event.universel === true;
}

async function generateFormattedEvents() {
    try {
        const { data: events, error } = await supabase
            .from('evenements')
            .select('*')
            .order('niveau_difficulte', { ascending: false });

        if (error) throw error;

        let output = "# RÉFÉRENCE DES ÉVÉNEMENTS HISTORIQUES\n\n";

        output += "## ÉVÉNEMENTS UNIVERSELLEMENT CONNUS\n";
        output += "Ces événements sont des points de repère majeurs de l'histoire mondiale :\n";
        events
            .filter(event => event.universel)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach(event => {
                output += `- ${event.titre} (${formatDate(event.date)})\n`;
            });
        output += "\n";

        output += "## ÉVÉNEMENTS MAJEURS PAR THÉMATIQUE\n\n";

        const themes = [
            "Guerres et Conflits",
            "Science et Découvertes",
            "Politique et Société",
            "Innovations Technologiques",
            "Culture et Arts",
            "Économie et Commerce"
        ];

        themes.forEach(theme => {
            const themeEvents = events.filter(event => 
                getMainTheme(event) === theme && 
                isMajorEvent(event)
            );

            if (themeEvents.length > 0) {
                output += `### ${theme}\n`;
                themeEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .forEach(event => {
                        output += `- ${event.titre} (${formatDate(event.date)})`
                        if (event.niveau_difficulte >= 8) output += " [Événement majeur]";
                        output += "\n";
                    });
                output += "\n";
            }
        });

        output += `\n## GUIDE POUR L'IA
Pour suggérer de nouveaux événements historiques :
1. Cette liste contient ${events.length} événements existants
2. Vérifiez si l'événement ou un équivalent est déjà présent
3. Privilégiez les événements de même importance que ceux listés ci-dessus
4. Évitez les doublons même avec des formulations différentes
5. Pour chaque suggestion, indiquez son importance historique\n`;

        // Chemin corrigé
        await writeFile('./reference_evenements.md', output);
        console.log('Fichier de référence créé avec succès !');

    } catch (error) {
        console.error('Erreur:', error);
    }
}

generateFormattedEvents();