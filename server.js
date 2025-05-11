const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname)));

// 💡 Leitet automatisch auf die Startseite um!
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "htmls", "StartSite.html"));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
