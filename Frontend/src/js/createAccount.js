document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  console.log("📦 createAccount.js geladen");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
      alert("❗ Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await res.text();
console.log("📄 Serverantwort:", text);
let data;
try {
  data = JSON.parse(text);
} catch (err) {
  console.error("❌ Keine gültige JSON-Antwort:", err);
  alert("❌ Serverfehler – Details siehe Konsole.");
  return;
}

      if (res.ok) {
        alert("✅ Registrierung erfolgreich! Du kannst dich nun einloggen.");
        window.location.href = "login.html";
      } else {
        alert("❌ " + (data.message || "Fehler bei der Registrierung."));
      }
    } catch (err) {
      console.error("Registrierung fehlgeschlagen:", err);
      alert("❌ Netzwerkfehler.");
    }
  });
});