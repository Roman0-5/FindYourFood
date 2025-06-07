document.addEventListener("DOMContentLoaded", () => {
  const form    = document.getElementById("login-form");
  const message = document.getElementById("statusMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const payload = {
      username: form.username.value.trim(),
      password: form.password.value
    };

    try {
      const res  = await fetch("/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.token) localStorage.setItem('token', data.token);

      // Optional: Benutzernamen speichern für Anzeige (wenn deine API ihn zurückliefert)
      if (data.username) {
        localStorage.setItem('username', data.username);
      }

      message.style.color = "green";
      message.textContent = "✅ Login erfolgreich! Weiterleitung…";
      setTimeout(() => window.location.href = "/StartSite.html", 1500); // zur Startseite
    } catch (err) {
      message.style.color = "var(--color-accent)";
      message.textContent = `❌ ${err.message}`;
    }
  });
});
