const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabase = createClient('https://ppxmtnuewcixbbmhnzzc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweG10bnVld2NpeGJibWhuenpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4OTkxMjcsImV4cCI6MjA0MjQ3NTEyN30.0z2be74E3db-XvyIKXPlogI__9Ric1Il4cZ1Fs7TJ5U');

// Dossier temporaire pour stocker les images compressées localement
const tempFolder = path.join(__dirname, 'temp');

// Créer le dossier temporaire s'il n'existe pas
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
}

// Fonction pour récupérer et compresser les images
async function compressImages(bucketName) {
    try {
        // Récupérer la liste des fichiers dans le bucket
        console.log("Récupération des fichiers du bucket :", bucketName);
        const { data: files, error } = await supabase
            .storage
            .from(bucketName)
            .list('', { limit: 100 }); // Liste sans filtre d'extension

        if (error) {
            console.error('Erreur lors de la récupération des fichiers:', error);
            return;
        }

        if (!files || files.length === 0) {
            console.log("Aucun fichier trouvé dans le bucket.");
            return;
        }

        console.log(`${files.length} fichiers trouvés dans le bucket.`);

        // Traiter chaque fichier
        for (const file of files) {
            console.log(`Téléchargement de l'image : ${file.name}`);
            const { data: imageBuffer, error: downloadError } = await supabase
                .storage
                .from(bucketName)
                .download(file.name);

            if (downloadError) {
                console.error(`Erreur lors du téléchargement de ${file.name}:`, downloadError);
                continue;
            }

            // Créer un chemin temporaire local pour stocker l'image
            const tempFilePath = path.join(tempFolder, file.name);

            // Écrire le fichier temporairement
            fs.writeFileSync(tempFilePath, Buffer.from(await imageBuffer.arrayBuffer()));

            console.log(`Compression de l'image : ${file.name}`);
            // Compresser l'image
            const compressedImageBuffer = await sharp(tempFilePath)
                .resize({ width: 800 }) // Redimensionner si nécessaire
                .jpeg({ quality: 80 }) // Ajuster la qualité si nécessaire
                .toBuffer();

            // Écrire le fichier compressé dans un fichier temporaire
            const compressedFilePath = path.join(tempFolder, `compressed_${file.name}`);
            fs.writeFileSync(compressedFilePath, compressedImageBuffer);

            console.log(`Remplacement de l'image : ${file.name}`);
            // Supprimer l'ancienne image et télécharger la nouvelle
            await supabase
                .storage
                .from(bucketName)
                .remove([file.name]);

            const { error: uploadError } = await supabase
                .storage
                .from(bucketName)
                .upload(file.name, fs.createReadStream(compressedFilePath));

            if (uploadError) {
                console.error(`Erreur lors du remplacement de ${file.name}:`, uploadError);
            } else {
                console.log(`Image compressée et remplacée avec succès : ${file.name}`);
            }

            // Supprimer les fichiers temporaires
            fs.unlinkSync(tempFilePath);
            fs.unlinkSync(compressedFilePath);
        }
    } catch (err) {
        console.error("Une erreur inattendue est survenue :", err);
    }
}

// Appeler la fonction avec le nom de votre bucket
compressImages('evenements-image');
