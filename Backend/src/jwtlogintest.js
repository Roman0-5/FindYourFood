// !!! Um diese und requests.rest Datei zu nutzen node jwtlogintest.js ausführen (vllt node Backend/src/jwtlogintest.js)
import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;


app.use(express.json()); 

app.get("/post", authenticateToken, (req, res) => {
  res.json(posts.filter(post => post.username === req.user.name))
})

app.post("/loginTEST", (req, res) => {
  const { username, password } = req.body;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (token == null ) return res.sendStatus(401); // Wenn kein Token vorhanden ist, 401 Unauthorized zurückgeben

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Wenn Token ungültig ist, 403 Forbidden zurückgeben
        req.user = user; // Benutzerinformationen aus dem Token extrahieren
        next(); // Weiter zur nächsten Middleware oder Route
    });
}





app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

