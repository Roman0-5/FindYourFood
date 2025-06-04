// ================================
// SIMPLE DATABASE TEST
// Erstellt users.db mit Test-Daten
// ================================

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

console.log("🗄️  Creating SQLite database...");

// Datenbank erstellen/öffnen
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  } else {
    console.log("✅ Connected to SQLite database: users.db");
    setupDatabase();
  }
});

// Datenbank-Setup
function setupDatabase() {
  // Users-Tabelle erstellen
  db.run(
    `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `,
    (err) => {
      if (err) {
        console.error("❌ Error creating users table:", err);
      } else {
        console.log("✅ Users table created/verified");
        createTestUsers();
      }
    }
  );

  // Geschmacksprofil-Tabelle für später
  db.run(
    `
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            cuisine_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `,
    (err) => {
      if (err) {
        console.error("❌ Error creating preferences table:", err);
      } else {
        console.log("✅ Preferences table created/verified");
      }
    }
  );
}

// Test-User erstellen
async function createTestUsers() {
  console.log("\n📝 Creating test users...");

  const testUsers = [
    { username: "admin", email: "admin@test.com", password: "admin123" },
    { username: "user1", email: "user1@test.com", password: "password123" },
    { username: "test", email: "test@test.com", password: "test123" },
  ];

  for (const user of testUsers) {
    try {
      // Password hashen
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // User in DB einfügen
      db.run(
        "INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [user.username, user.email, hashedPassword],
        function (err) {
          if (err) {
            console.log(`⚠️  User ${user.username} already exists`);
          } else if (this.changes > 0) {
            console.log(
              `✅ Created user: ${user.username} (ID: ${this.lastID})`
            );

            // Test-Präferenzen für user1 hinzufügen
            if (user.username === "user1") {
              addTestPreferences(this.lastID);
            }
          }
        }
      );
    } catch (error) {
      console.error(`❌ Error creating user ${user.username}:`, error);
    }
  }

  // Nach kurzer Verzögerung alle User anzeigen
  setTimeout(showAllUsers, 1000);
}

// Test-Präferenzen hinzufügen
function addTestPreferences(userId) {
  const preferences = ["italian", "japanese", "mexican"];

  preferences.forEach((pref) => {
    db.run(
      "INSERT INTO user_preferences (user_id, cuisine_type) VALUES (?, ?)",
      [userId, pref],
      (err) => {
        if (err) {
          console.error(`❌ Error adding preference ${pref}:`, err);
        } else {
          console.log(`✅ Added preference: ${pref} for user ${userId}`);
        }
      }
    );
  });
}

// Alle User anzeigen (zum Testen)
function showAllUsers() {
  console.log("\n👥 All users in database:");
  console.log("ID | Username | Email | Created");
  console.log("---|----------|-------|--------");

  db.all("SELECT id, username, email, created_at FROM users", (err, rows) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
    } else {
      rows.forEach((row) => {
        const date = new Date(row.created_at).toLocaleDateString();
        console.log(
          `${row.id}  | ${row.username.padEnd(8)} | ${row.email.padEnd(
            15
          )} | ${date}`
        );
      });
    }

    // Präferenzen anzeigen
    showUserPreferences();
  });
}

// User-Präferenzen anzeigen
function showUserPreferences() {
  console.log("\n🍽️  User preferences:");

  db.all(
    `
        SELECT u.username, GROUP_CONCAT(up.cuisine_type, ', ') as preferences
        FROM users u
        LEFT JOIN user_preferences up ON u.id = up.user_id
        GROUP BY u.id, u.username
    `,
    (err, rows) => {
      if (err) {
        console.error("❌ Error fetching preferences:", err);
      } else {
        rows.forEach((row) => {
          const prefs = row.preferences || "none";
          console.log(`${row.username}: ${prefs}`);
        });
      }

      // Test abschließen
      finishTest();
    }
  );
}

// Test beenden
function finishTest() {
  console.log("\n🎉 Database test completed!");
  console.log("📁 Database file created: users.db");
  console.log("\n💡 You can now:");
  console.log("   - View the database with: sqlite3 users.db");
  console.log("   - Run SQL queries: SELECT * FROM users;");
  console.log("   - Use this database in your login system");

  // Verbindung schließen
  db.close((err) => {
    if (err) {
      console.error("❌ Error closing database:", err);
    } else {
      console.log("✅ Database connection closed");
    }
    process.exit(0);
  });
}

// Error handling
process.on("SIGINT", () => {
  console.log("\n🛑 Interrupted. Closing database...");
  db.close();
  process.exit(0);
});

db.on("error", (err) => {
  console.error("❌ Database error:", err);
});
