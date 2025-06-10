// === Fertige server.js ===
import path from 'path';
import { fileURLToPath } from 'url';
import { findUserByUsername, createUser, verifyPassword, updateUser, deleteUserById, openDb, initializePreferencesTable } from '../database/database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log(' ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'Gefunden ' : 'Fehlt ');
console.log(' API_KEY geladen:', process.env.API_KEY); // DEBUG

// JWT
import jwt from 'jsonwebtoken';
import express from 'express';
import fetch from 'node-fetch';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';

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
    console.log("🔍 Login-Versuch für Benutzer:", username);
    console.log("ID: ", user.id);
    const token = jwt.sign({ name: user.username, id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.json({ message: 'Login erfolgreich', token });
  } catch (err) {
    console.error('❌ Login-Fehler:', err);
    res.status(500).json({ message: 'Serverfehler beim Login' });
  }
  console.log("🔑 JWT Token generiert für Benutzer:", username);
});

// Logout Route
app.post('/logout', (req, res) => {
  res.json({ message: 'Logout erfolgreich' });
});
// Route für userSearch.html
app.get('/userSearch.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/src/pages', 'userSearch.html'));
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

// === Swagger UI ===
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// === Statische Dateien ===
app.use(express.static(path.join(__dirname, '../../Frontend/src/pages'))); // Zwei Ebenen hoch
app.use('/js', express.static(path.join(__dirname, '../../Frontend/src/js')));
app.use('/css', express.static(path.join(__dirname, '../../Frontend/src/css')));
app.use('/partials', express.static(path.join(__dirname, '../../Frontend/src/partials')));

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

// PUT /api/users/me – Profil aktualisieren
app.put('/api/users/me', authenticateJWT, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email && !password) {
    return res.status(400).json({ message: 'Mindestens ein Feld muss angegeben werden' });
  }

  try {
    const user = await findUserByUsername(req.user.name);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const updatedUser = { id: user.id };
    if (username) updatedUser.username = username;
    if (email) updatedUser.email = email;
    if (password) {
      updatedUser.password_hash = await bcrypt.hash(password, 10);
    }

    const result = await updateUser(updatedUser);

    if (result.success) {
      return res.json({ message: 'Profil aktualisiert' });
    } else {
      return res.status(500).json({ message: 'Aktualisierung fehlgeschlagen', error: result.error });
    }
  } catch (err) {
    console.error('❌ Fehler bei Profil-Update:', err);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

app.delete('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const result = await deleteUserById(req.user.id);

    if (!result.success) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden oder Fehler beim Löschen' });
    }

    res.json({ message: 'Account gelöscht' });
  } catch (err) {
    console.error("❌ Fehler beim Löschen des Accounts:", err);
    res.status(500).json({ message: 'Fehler beim Löschen des Accounts' });
  }
});

// === GESCHMACKSPROFIL API ROUTEN MIT ECHTER DATENBANK ===

// GET /api/preferences - Präferenzen laden
app.get('/api/preferences', authenticateJWT, async (req, res) => {
  try {
    const db = await openDb();
    const preferences = await db.all(
      'SELECT cuisine_type FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );
    
    const cuisineTypes = preferences.map(pref => pref.cuisine_type);
    console.log('📥 Präferenzen geladen für User:', req.user.name, '→', cuisineTypes);
    
    res.json({ success: true, preferences: cuisineTypes });
  } catch (err) {
    console.error('❌ Fehler beim Laden der Präferenzen:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

// POST /api/preferences - Präferenz hinzufügen
app.post('/api/preferences', authenticateJWT, async (req, res) => {
  const { cuisine_type } = req.body;
  console.log('📥 Neue Präferenz hinzufügen:', cuisine_type, 'für User:', req.user.name);
  
  if (!cuisine_type) {
    return res.status(400).json({ success: false, message: 'cuisine_type fehlt' });
  }
  
  try {
    const db = await openDb();
    
    // Prüfen ob bereits vorhanden
    const existing = await db.get(
      'SELECT id FROM user_preferences WHERE user_id = ? AND cuisine_type = ?',
      [req.user.id, cuisine_type]
    );
    
    if (existing) {
      return res.status(409).json({ success: false, message: 'Präferenz bereits vorhanden' });
    }
    
    // Neue Präferenz hinzufügen
    await db.run(
      'INSERT INTO user_preferences (user_id, cuisine_type) VALUES (?, ?)',
      [req.user.id, cuisine_type]
    );
    
    console.log('✅ Präferenz gespeichert:', cuisine_type);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Hinzufügen der Präferenz:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

// DELETE /api/preferences/:cuisine - Präferenz entfernen  
app.delete('/api/preferences/:cuisine', authenticateJWT, async (req, res) => {
  const { cuisine } = req.params;
  console.log('🗑️ Präferenz entfernen:', cuisine, 'für User:', req.user.name);
  
  try {
    const db = await openDb();
    const result = await db.run(
      'DELETE FROM user_preferences WHERE user_id = ? AND cuisine_type = ?',
      [req.user.id, cuisine]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Präferenz nicht gefunden' });
    }
    
    console.log('✅ Präferenz entfernt:', cuisine);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Entfernen der Präferenz:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

// PUT /api/preferences - Alle Präferenzen aktualisieren
app.put('/api/preferences', authenticateJWT, async (req, res) => {
  const { preferences } = req.body;
  console.log('💾 Präferenzen speichern:', preferences, 'für User:', req.user.name);
  
  if (!Array.isArray(preferences)) {
    return res.status(400).json({ success: false, message: 'preferences muss ein Array sein' });
  }
  
  try {
    const db = await openDb();
    
    // Transaction starten
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Alle alten Präferenzen löschen
      await db.run('DELETE FROM user_preferences WHERE user_id = ?', [req.user.id]);
      
      // Neue Präferenzen einfügen
      for (const cuisine_type of preferences) {
        await db.run(
          'INSERT INTO user_preferences (user_id, cuisine_type) VALUES (?, ?)',
          [req.user.id, cuisine_type]
        );
      }
      
      await db.run('COMMIT');
      console.log('✅ Alle Präferenzen aktualisiert');
      res.json({ success: true });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('❌ Fehler beim Speichern der Präferenzen:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

// DELETE /api/preferences - Alle Präferenzen löschen
app.delete('/api/preferences', authenticateJWT, async (req, res) => {
  console.log('🔄 Alle Präferenzen zurücksetzen für User:', req.user.name);
  
  try {
    const db = await openDb();
    const result = await db.run(
      'DELETE FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );
    
    console.log(`✅ ${result.changes} Präferenzen gelöscht`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Fehler beim Zurücksetzen der Präferenzen:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

// GET /api/preferences/export - Präferenzen exportieren
app.get('/api/preferences/export', authenticateJWT, async (req, res) => {
  console.log('📤 Präferenzen exportieren für User:', req.user.name);
  
  try {
    const db = await openDb();
    const preferences = await db.all(
      'SELECT cuisine_type FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );
    
    const exportData = {
      user: req.user.name,
      preferences: preferences.map(pref => pref.cuisine_type),
      exportDate: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="geschmacksprofil_${req.user.name}.json"`);
    res.json(exportData);
  } catch (err) {
    console.error('❌ Fehler beim Exportieren der Präferenzen:', err);
    res.status(500).json({ success: false, message: 'Serverfehler' });
  }
});

app.get('/api/recommendation', authenticateJWT, async (req, res) => {
    try {
  
  
      const user = await findUserByUsername(req.user.name);
  
  
      if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });
  
  
  
  
  
      const db = await openDb();
  
  
      const prefs = await db.all(
  
  
        'SELECT cuisine_type FROM user_preferences WHERE user_id = ?',
  
  
        [user.id]
  
  
      );
  
  
  
  
  
      if (!prefs || prefs.length === 0) {
  
  
        return res.status(404).json({ message: 'Keine Geschmackspräferenzen gespeichert' });
  
  
      }
  
  
  
  
  
      const randomCuisine = prefs[Math.floor(Math.random() * prefs.length)].cuisine_type;
  
  
      const apiKey = process.env.API_KEY;
  
  
      const city = "Wien"; // oder dynamisch per User/Browser/IP
  
  
  
  
  
      const url = `https://api.tomtom.com/search/2/search/${randomCuisine}%20restaurant%20${city}.json?key=${apiKey}&limit=1`;
  
  
  
  
  
      const response = await fetch(url);
  
  
      const data = await response.json();
  
  
  
  
  
      if (data.results && data.results.length > 0) {
  
  
        res.json({ success: true, restaurant: data.results[0], cuisine: randomCuisine });
  
  
      } else {
  
  
        res.json({ success: false, message: 'Keine passende Empfehlung gefunden' });
  
  
      }
  
  
  
  
  
    } catch (err) {
  
  
      console.error("❌ Fehler bei /api/recommendation:", err);
  
  
      res.status(500).json({ message: 'Fehler bei der Empfehlung' });
  
  
    }
  
  
  });

// Datenbank initialisieren
async function initializeDatabase() {
  try {
    await initializePreferencesTable();
    console.log('✅ Präferenzen-Tabelle initialisiert');
  } catch (err) {
    console.error('❌ Fehler bei DB-Initialisierung:', err);
  }
}

// Server starten
app.listen(PORT, async () => {
  console.log(`\n✅ Server läuft unter: http://localhost:${PORT}`);
  console.log(`📚 Swagger-Doku: http://localhost:${PORT}/api-docs`);
  
  // Datenbank initialisieren
  await initializeDatabase();
});