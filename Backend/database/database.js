import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDb() {
  const dbPath = path.resolve(__dirname, 'users.db');
  console.log("📁 Öffne Datenbank unter Pfad:", dbPath);  // << DEBUG
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export async function createUser({username, email, password}) {
  const db = await openDb();
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    return { success: true };
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return { success: false, message: 'Benutzername oder E-Mail existiert bereits' };
    }
    throw err;
  }
}

export async function findUserByUsername(username) {
  const db = await openDb();
  const user = await db.get(
    'SELECT id, username, email, password_hash FROM users WHERE username = ?',
    [username]
  );
  return user;
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function updateUser(userData) {
  const db = await openDb();
  const fields = [];
  const values = [];

  if (userData.username) {
    fields.push("username = ?");
    values.push(userData.username);
  }
  if (userData.email) {
    fields.push("email = ?");
    values.push(userData.email);
  }
  if (userData.password_hash) {
    fields.push("password_hash = ?");
    values.push(userData.password_hash);
  }

  if (fields.length === 0) {
    return { success: false, error: "Kein gültiges Feld zum Aktualisieren" };
  }

  values.push(userData.id);

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

  try {
    await db.run(sql, values);
    return { success: true };
  } catch (err) {
    console.error("❌ Fehler beim Update in DB:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteUserById(id) {
  const db = await openDb();
  try {
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return { success: result.changes > 0 };
  } catch (err) {
    console.error("❌ Fehler in deleteUserById:", err);
    return { success: false, error: err.message };
  }
}