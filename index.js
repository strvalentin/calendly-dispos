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

// Sert les fichiers HTML statiques
app.use(express.static(__dirname));

// 🔁 Mise à jour auto toutes les 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await updateCalendly(
    'https://calendly.com/ev-grandiose/seance-1h-avec-lana',
    'dispo-190.html'
  );
  await updateCalendly(
    'https://calendly.com/ev-grandiose/1er-rdv-accompagnement-4-seances-avec-lana',
    'dispo-600.html'
  );
});

async function updateCalendly(eventLink, outputFile) {
  try {
    const response = await fetch('https://api.calendly.com/scheduling_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CALENDLY_API_KEY}`
      },
      body: JSON.stringify({
        owner: eventLink,
        max_event_count: 1
      })
    });

    const data = await response.json();

    if (!response.ok || !data.resource?.booking_url) {
      console.error(`❌ Erreur Calendly (${outputFile})`, data);
      return;
    }

    const bookingUrl = data.resource.booking_url;
    const html = `
      <div style="font-family: sans-serif; font-size: 16px;">
        Prochain créneau disponible : <a href="${bookingUrl}" target="_blank">${bookingUrl}</a>
      </div>
    `;

    fs.writeFileSync(path.join(__dirname, outputFile), html);
    console.log(`✅ ${outputFile} mis à jour`);
  } catch (error) {
    console.error(`❌ Exception Calendly (${outputFile})`, error);
  }
}

app.listen(port, () => {
  console.log(`✅ Serveur en écoute sur le port ${port}`);
});
