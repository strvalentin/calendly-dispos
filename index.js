import fetch from 'node-fetch';
import fs from 'fs';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;

const TOKEN = 'Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzUxOTEyMDY2LCJqdGkiOiIzYWNhNzBlMy01NmU0LTQyYzAtOGE5ZS0yODE4ZmFjZjcxMjgiLCJ1c2VyX3V1aWQiOiIwMDY2NGZkZC01Y2NkLTRmNmUtYTFmOS1jOWEyNmEwOWUwODkifQ.Ad30Kl8gM70HTKIpd1wTFQclsoNcmmUxBg4IQU5wbXIF7daI7lfle8VvsQZOhSb5T_wqfHMhv9jgnlKMkTFXiA'; // 🔁 remplace par ton vrai token PAT

// ⚠️ NE PAS mettre les URL calendly.com ici ! Utilise les ID API
const eventTypes = [
  'https://api.calendly.com/event_types/af5a4b3a-e358-45b3-93c2-fcd1b05d89cd', // Séance 1h
  'https://api.calendly.com/event_types/03a7e8b2-285b-47df-962c-2cb23b571008'  // Accompagnement 4 séances
];

const fileNames = {
  'af5a4b3a-e358-45b3-93c2-fcd1b05d89cd': 'dispo-190.html',
  '03a7e8b2-285b-47df-962c-2cb23b571008': 'dispo-600.html'
};

async function createSchedulingLink(eventTypeUrl) {
  try {
    const response = await fetch('https://api.calendly.com/scheduling_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': TOKEN
      },
      body: JSON.stringify({
        owner: eventTypeUrl,
        owner_type: 'EventType',
        max_event_count: 1
      })
    });

    const data = await response.json();

    if (!response.ok || !data.resource) {
      console.error(`❌ Erreur pour ${eventTypeUrl}`, data);
      return;
    }

    const eventId = eventTypeUrl.split('/').pop();
    const fileName = fileNames[eventId];

    if (fileName) {
      const html = `<p>Créneaux à jour : <a href="${data.resource.booking_url}" target="_blank">${data.resource.booking_url}</a></p>`;
      fs.writeFileSync(fileName, html);
      console.log(`✅ Fichier ${fileName} mis à jour`);
    }
  } catch (error) {
    console.error('❌ Erreur réseau ou serveur :', error);
  }
}

// ➕ Régénérer les fichiers toutes les 5 min
setInterval(() => {
  for (const eventUrl of eventTypes) {
    createSchedulingLink(eventUrl);
  }
}, 5 * 60 * 1000);

// ➕ Serveur Express pour exposer les fichiers HTML
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
