// === Fertige server.js ===
import path from 'path';
import { fileURLToPath } from 'url';
import { findUserByUsername, createUser, verifyPassword } from '../database/database.js';
//import * as db from '../database/database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log(' ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'Gefunden ' : 'Fehlt ');
console.log(' API_KEY geladen:', process.env.API_KEY); // DEBUG

// JWT
import jwt from 'jsonwebtoken';
import express from 'express';
import fetch from 'node-fetch';
//import session from 'express-session'; - löschen wenn JWT implementiert
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';

// Für __dirname in ES-Modulen


const app = express();
const PORT = 3000;
app.use(express.json());


// === Debug Logs ===
console.log(' ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'OK' : 'FEHLT!');
console.log(' API_KEY geladen:', process.env.API_KEY || 'FEHLT!');


// === JWT Middleware ===
function authenticateJWT (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401); //falls kein Token geschickt wird

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); //Token ungültig oder abgelaufen
    req.user = user; //Benutzerinfo in Request speichern
    next(); //Zugriff gewähren
  });
}


//neue Login Route - kein Hardcode mehr
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Benutzer nicht gefunden' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Falsches Passwort' });
    }

    const token = jwt.sign({ name: user.username, id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.json({ message: 'Login erfolgreich', token });
  } catch (err) {
    console.error('❌ Login-Fehler:', err);
    res.status(500).json({ message: 'Serverfehler beim Login' });
  }
});
//Login Status prüfen
app.get('/me', authenticateJWT, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

// GET /api/users/me – Profil des eingeloggten Nutzers

app.get('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const user = await findUserByUsername(req.user.name);
    if (!user) {
      return res.status(404).json({ message: 'User nicht gefunden' });
    }
    res.json({
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email
      }
    });
  } catch (err) {
    console.error('❌ Fehler in GET /api/users/me:', err);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});


//Route für Registrierung
app.post('/register', async (req, res) => {
  console.log("📥 POST /register erhalten:", req.body);

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("⚠️ Fehlende Felder");
    return res.status(400).json({ message: 'Alle Felder erforderlich' });
  }

  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      console.log("⚠️ Benutzername bereits vergeben");
      return res.status(409).json({ message: 'Benutzername bereits vergeben' });
    }

    const result = await createUser({ username, email, password });
    if (result.success) {
      const token = jwt.sign(
          { name: username, id: result.userId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );
      return res.status(201).json({ message: 'Benutzer erstellt', token });
    } else {
      console.log("❌ Fehler bei createUser:", result);
      return res.status(500).json({ message: 'Registrierung fehlgeschlagen', error: result.message });
    }
  } catch (error) {
    console.error('❌ Fehler bei Registrierung (Catch):', error);
    return res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});




/*

// === Session Management ===import dotenv from 'dotenv';
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

*/

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

app.get('/createAccount.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/src/pages', 'createAccount.html'));
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