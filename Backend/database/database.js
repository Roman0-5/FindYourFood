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
// Update User (nur username & email)
export async function updateUser({ id, username, email }) {
  const db = await openDb();
  try {
    await db.run(
        'UPDATE users SET username = ?, email = ? WHERE id = ?',
        [username, email, id]
    );
    return { success: true };
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return { success: false, message: 'Username oder E-Mail bereits vergeben' };
    }
    throw err;
  }
}
