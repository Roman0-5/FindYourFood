document.addEventListener("DOMContentLoaded", () => {
  const form    = document.getElementById("create-account-form");
  const message = document.getElementById("message");
  console.log("🧪 createAccount.js geladen");

  if (!form) {
    console.error("❌ Formular nicht gefunden.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const username = form.querySelector("#username")?.value.trim();
    const email    = form.querySelector("#email")?.value.trim();
    const password = form.querySelector("#password")?.value;

    if (!username || !email || !password) {
      message.style.color = "darkred";
      message.textContent = "❗ Bitte alle Felder ausfüllen.";
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Fehler bei der Registrierung.");

      message.style.color = "green";
      message.textContent = "✅ Registrierung erfolgreich! Weiterleitung…";
      setTimeout(() => window.location.href = "login.html", 1500);

    } catch (err) {
      console.error("❌ Fehler:", err);
      message.style.color = "darkred";
      message.textContent = `❌ ${err.message || "Unbekannter Fehler"}`;
    }
  });
});
