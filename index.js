import fetch from 'node-fetch';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// 📁 Sert les fichiers statiques (HTML)
app.use(express.static(__dirname));

// 🔁 Met à jour les créneaux toutes les 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await updateCalendly(
    'https://api.calendly.com/event_types/ce6fc84f-4b45-48c7-b7a1-d41697866d3e/available_times',
    'dispo-190.html'
  );

  await updateCalendly(
    'https://api.calendly.com/event_types/f415b12e-4a3c-42e6-9de4-93198ad9b1a4/available_times',
    'dispo-600.html'
  );
});

// 🔧 Fonction pour récupérer les créneaux et écrire le fichier HTML
async function updateCalendly(apiUrl, outputFile) {
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const slots = data.collection;

    if (!slots || slots.length === 0) {
      fs.writeFileSync(path.join(__dirname, outputFile), `Aucun créneau disponible pour le moment.`);
      console.log(`❌ Aucun créneau dans ${outputFile}`);
      return;
    }

    // Prend le premier créneau et le formate proprement
    const start = new Date(slots[0].start_time);
    const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' };
    const formatted = start.toLocaleString('fr-FR', options);

    const finalText = `Prochain créneau : ${formatted.charAt(0).toUpperCase() + formatted.slice(1)}`;

    fs.writeFileSync(path.join(__dirname, outputFile), finalText);
    console.log(`✅ ${outputFile} mis à jour`);
  } catch (err) {
    console.error(`❌ Erreur Calendly (${outputFile})`, err);
  }
}

// ▶️ Démarre le serveur
app.listen(port, () => {
  console.log(`✅ Serveur en écoute sur le port ${port}`);
});
