import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// ⛓️ Damit __dirname funktioniert (da es in ESM nicht existiert)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Statische Pfade setzen
app.use(express.static(path.join(__dirname, 'htmls')));
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/javascripts', express.static(path.join(__dirname, 'javascripts')));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'htmls', 'StartSite.html'));
});

//  Ergebnisseite
app.get('/Results.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'htmls', 'Results.html'));
});

// Such-Endpoint wie in Swagger definiert
app.get('/search', async (req, res) => {
  const { query, city, category, limit = 5, openingHours = "any" } = req.query;

  const apiKey = 'XBGR9rfvBUGOxGERVE0cBc3flVg9auOW';
  const q = `${query} ${city}`;
  const categories = category ? `&categorySet=${category}` : '';
  const opening = openingHours === 'nextSevenDays' ? '&openingHours=nextSevenDays' : '';

  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(q)}.json?key=${apiKey}&limit=${limit}&countrySet=AT&idxSet=POI&minFuzzyLevel=1&maxFuzzyLevel=2${categories}${opening}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("TomTom API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft unter: http://localhost:${PORT}`);
});