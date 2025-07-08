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

async function updateCalendly(eventLink, outputFile) {
  try {
    const schedulingUrl = eventLink;
    const html = `<div style="font-family: sans-serif; font-size: 16px;">Prochain créneau disponible : <a href="${schedulingUrl}" target="_blank">${schedulingUrl}</a></div>`;
    fs.writeFileSync(path.join(__dirname, outputFile), html);
    console.log(`✅ Fichier ${outputFile} mis à jour`);
  } catch (err) {
    console.error(`❌ Erreur pour ${eventLink}`, err);
  }
}

// 📂 Sert les fichiers HTML statiques
app.use(express.static(__dirname));

// 🚀 Fonction async pour tout lancer proprement
const startServer = async () => {
  // Mise à jour immédiate
  await updateCalendly('https://calendly.com/ev-grandiose/seance-1h-avec-lana', 'dispo-190.html');
  await updateCalendly('https://calendly.com/ev-grandiose/1er-rdv-accompagnement-4-seances-avec-lana', 'dispo-600.html');

  // Cron toutes les 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await updateCalendly('https://calendly.com/ev-grandiose/seance-1h-avec-lana', 'dispo-190.html');
    await updateCalendly('https://calendly.com/ev-grandiose/1er-rdv-accompagnement-4-seances-avec-lana', 'dispo-600.html');
  });

  app.listen(port, () => {
    console.log(`✅ Serveur en écoute sur le port ${port}`);
  });
};

startServer();
