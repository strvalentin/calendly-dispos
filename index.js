const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const events = [
  {
    url: "https://calendly.com/ev-grandiose/seance-1h-avec-lana",
    htmlFile: "dispo-190.html",
  },
  {
    url: "https://calendly.com/ev-grandiose/1er-rdv-accompagnement-4-seances-avec-lana",
    htmlFile: "dispo-600.html",
  },
];

async function fetchAvailableSlots(eventUrl) {
  try {
    const response = await fetch(
      `https://api.calendly.com/scheduling_links`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        },
        body: JSON.stringify({
          owner: eventUrl,
          max_event_count: 1, // OBLIGATOIREMENT 1 selon la doc
        }),
      }
    );

    const data = await response.json();

    if (data.collection && data.collection.length > 0) {
      return "Créneaux disponibles ✅";
    } else {
      return "Créneaux non disponibles actuellement";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    return "Erreur lors de la récupération des créneaux";
  }
}

async function updateHtmlFiles() {
  for (const event of events) {
    const status = await fetchAvailableSlots(event.url);
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: sans-serif;
              font-size: 18px;
              color: ${status.includes("non") ? "red" : "green"};
              padding: 1em;
            }
          </style>
        </head>
        <body>${status}</body>
      </html>
    `;
    fs.writeFileSync(path.join(__dirname, event.htmlFile), html);
  }
}

app.use(express.static(__dirname));

app.listen(PORT, async () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
  await updateHtmlFiles();
});
