const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ton token API Calendly
const TOKEN = 'Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzUxOTEyMDY2LCJqdGkiOiIzYWNhNzBlMy01NmU0LTQyYzAtOGE5ZS0yODE4ZmFjZjcxMjgiLCJ1c2VyX3V1aWQiOiIwMDY2NGZkZC01Y2NkLTRmNmUtYTFmOS1jOWEyNmEwOWUwODkifQ.Ad30Kl8gM70HTKIpd1wTFQclsoNcmmUxBg4IQU5wbXIF7daI7lfle8VvsQZOhSb5T_wqfHMhv9jgnlKMkTFXiA';

// URLs des événements Calendly
const EVENTS = [
  {
    url: 'https://calendly.com/ev-grandiose/seance-1h-avec-lana',
    file: 'dispo-190.html',
  },
  {
    url: 'https://calendly.com/ev-grandiose/1er-rdv-accompagnement-4-seances-avec-lana',
    file: 'dispo-600.html',
  },
];

// Fonction de récupération des créneaux disponibles
async function fetchAvailabilityPage(eventUrl) {
  const res = await fetch('https://api.calendly.com/scheduling_links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': TOKEN,
    },
    body: JSON.stringify({
      owner: eventUrl,
      owner_type: 'EventType',
      max_event_count: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.resource) {
    console.error(`❌ Erreur pour ${eventUrl}`, data);
    return '<p style="color:red">Créneaux non disponibles actuellement</p>';
  }

  return `<p><a href="${data.resource.booking_url}" target="_blank" rel="noopener">👉 Voir les créneaux disponibles ici</a></p>`;
}

// Génère les fichiers HTML avec mise à jour toutes les 5 minutes
async function updateAvailabilityPages() {
  for (const event of EVENTS) {
    const html = await fetchAvailabilityPage(event.url);
    fs.writeFileSync(event.file, `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; padding: 10px; font-size: 16px; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    console.log(`✅ Fichier ${event.file} mis à jour`);
  }
}

// ➕ Met à jour toutes les 5 minutes
setInterval(updateAvailabilityPages, 5 * 60 * 1000);
updateAvailabilityPages();

// 📂 Sert les fichiers HTML générés
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
