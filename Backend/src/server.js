// === Fertige server.js ===
import dotenv from 'dotenv';
dotenv.config();
console.log('🔑 API_KEY geladen:', process.env.API_KEY); // DEBUG

import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';

// Für __dirname in ES-Modulen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// === Session Management ===import dotenv from 'dotenv';
dotenv.config();
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // In dev okay
}));

app.post('/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'pass') {
    req.session.user = { name: 'admin' };
    res.json({ message: 'Login erfolgreich' });
  } else {
    res.status(401).json({ message: 'Login fehlgeschlagen' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout erfolgreich' });
});

app.get('/session-check', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// === Swagger UI ===
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// === Statische Dateien ===
app.use(express.static(path.join(__dirname, '../../Frontend/src/pages'))); // Zwei Ebenen hoch
app.use('/js', express.static(path.join(__dirname, '../../Frontend/src/js')));
app.use('/css', express.static(path.join(__dirname, '../../Frontend/src/css')));
// === HTML-Seiten Routing ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/src/pages', 'StartSite.html')); // Zwei Ebenen hoch
});

app.get('/Results.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/src/pages', 'Results.html')); // Zwei Ebenen hoch
});

// === API Endpoint ===
// server.js - KORRIGIERT
app.get('/search', async (req, res) => {
  console.log('🔍 Search Request received:', req.query);
  
  const { query, city, category, limit = 5, openingHours = "any" } = req.query;

  const apiKey = process.env.API_KEY;
  console.log('🔑 API Key from env:', apiKey ? 'LOADED' : 'MISSING');
  
  if (!apiKey) {
    console.log('❌ API Key fehlt!');
    return res.status(500).json({ error: "API Key nicht konfiguriert" });
  }

  const q = `${query} ${city}`;
  const categories = category ? `&categorySet=${category}` : '';
  const opening = openingHours === 'nextSevenDays' ? '&openingHours=nextSevenDays' : '';

  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(q)}.json?key=${apiKey}&limit=${limit}&countrySet=AT&idxSet=POI&minFuzzyLevel=1&maxFuzzyLevel=2${categories}${opening}`;
  
  console.log('🌐 Final URL:', url);

  try {
    const response = await fetch(url);
    console.log('📡 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📊 Response Data:', data);
    
    res.json(data);
  } catch (error) {
    console.error("❌ TomTom API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`\n✅ Server läuft unter: http://localhost:${PORT}`);
  console.log(`📚 Swagger-Doku: http://localhost:${PORT}/api-docs`);
});