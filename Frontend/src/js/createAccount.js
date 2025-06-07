document.addEventListener("DOMContentLoaded", () => {
  const form    = document.getElementById("create-account-form");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const payload = {
      username: form.username.value.trim(),
      email:    form.email.value.trim(),
      password: form.password.value
    };

    try {
      const res  = await fetch("/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      message.style.color   = "green";
      message.textContent   = "✅ Registrierung erfolgreich! Weiterleitung…";
      setTimeout(() => window.location.href = "login.html", 1500);
    } catch (err) {
      message.style.color   = "var(--color-accent)";
      message.textContent   = `❌ ${err.message}`;
    }
  });
});
