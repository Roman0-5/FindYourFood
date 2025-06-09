document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
  console.log("📄 profile.js geladen");

  const form = document.getElementById("profileForm");
  form.addEventListener("submit", handleFormSubmit);

  const deleteBtn = document.getElementById("deleteAccountBtn");
  deleteBtn.addEventListener("click", handleAccountDelete);
});

async function loadUserData() {
  try {
    const res = await fetch("/me", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await res.json();

    if (!res.ok || !data.user) {
      throw new Error("Nicht eingeloggt");
    }

    document.getElementById("username").value = data.user.username || "";
    document.getElementById("email").value = data.user.email || "";
  } catch (err) {
    alert("Bitte zuerst einloggen.");
    window.location.href = "/login.html";
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const payload = { username, email };
  if (password) payload.password = password;

  try {
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("✅ Änderungen gespeichert!");
    } else {
      const error = await res.json();
      alert("❌ Fehler: " + (error.message || "Unbekannt"));
    }
  } catch (err) {
    alert("❌ Netzwerkfehler");
  }
}

async function handleAccountDelete() {
  if (!confirm("❗ Bist du sicher, dass du deinen Account löschen willst?")) return;

  try {
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (res.ok) {
      localStorage.removeItem("token");
      alert("✅ Account gelöscht!");
      window.location.href = "/";
    } else {
      alert("❌ Fehler beim Löschen");
    }
  } catch (err) {
    alert("❌ Netzwerkfehler");
  }
}