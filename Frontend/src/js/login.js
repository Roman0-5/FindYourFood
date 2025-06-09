// === SESSION MANAGEMENT FUNCTIONS ===

// Beim Laden der Seite Session prüfen
document.addEventListener("DOMContentLoaded", function () {
  checkSession(); //Prüfung auf gültiges JWT im localstorage
  initializeForm(); //Demodaten
});

// Session Status prüfen
async function checkSession() {
  const token = localStorage.getItem("token"); //Ist Token da? Falls nicht ist User ausgeloggt

  if(!token) {
    updateUIForLoggedOutUser();
    return;
  }

  try {  //Nutzerabfrage
    const response = await fetch("/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      updateUIForLoggedOutUser();
      return;
    }

    const data = await response.json();
    updateUIForLoggedInUser(data.user);
  } catch (error) {
    console.error("JWT check error:", error);
    updateUIForLoggedOutUser();
  }
}

//UI abhängig von Login Status (eingeloggt)
function updateUIForLoggedInUser(user) {
  const sessionContent = document.getElementById("sessionContent");
  const loginForm = document.getElementById("loginForm");
  const logoutSection = document.getElementById("logoutSection");

  sessionContent.innerHTML = `
    <strong>Angemeldet als:</strong> ${user.name}<br>
    <small>JWT aktiv</small>
  `;
  loginForm.style.display = "none";
  logoutSection.style.display = "block";
}


//UI abhängig von Login Status (ausgeloggt)
function updateUIForLoggedOutUser() {
  const sessionContent = document.getElementById("sessionContent");
  const loginForm = document.getElementById("loginForm");
  const logoutSection = document.getElementById("logoutSection");

  
}
// Form initialisieren
function initializeForm() {
  // Demo-Daten vorausfüllen (nur für Testing)
  //document.getElementById("username").value = "admin";
  //document.getElementById("password").value = "pass";

  // Login Form Event Listener
  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

// === LOGIN FUNCTIONS ===

// Login Form Handler
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loading = document.getElementById("loading");
  const loginBtn = document.getElementById("loginBtn");
  const statusMessage = document.getElementById("statusMessage");

  // Validierung
  if (!username || !password) {
    showStatusMessage("error", "❌ Bitte alle Felder ausfüllen.");
    return;
  }

  // Loading anzeigen
  showLoading(true);
  loginBtn.disabled = true;
  hideStatusMessage();

  //Sendet Login-Daten an Server - bei Erfolt JWT speichern
  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    // Loading verstecken
    showLoading(false);
    loginBtn.disabled = false;

    if (response.ok) {
      // Erfolgreiche Anmeldung - speichert JWT im localStorage – wird für spätere Anfragen verwendet

      localStorage.setItem("token", result.token);
      showStatusMessage("success", `✅ ${result.message}`);


      // Nach kurzer Verzögerung zur Startseite weiterleiten
      setTimeout(() => {
        window.location.href = "/StartSite.html";
      }, 1500);
    } else {
      // Fehlgeschlagene Anmeldung
      showStatusMessage("error", `❌ ${result.message}`);
    }
  } catch (error) {
    // Netzwerkfehler
    showLoading(false);
    loginBtn.disabled = false;
    showStatusMessage(
      "error",
      "❌ Verbindungsfehler. Bitte versuche es später erneut."
    );
    console.error("Login error:", error);
  }
}

// === LOGOUT FUNCTIONS ===

// Logout Function - Entfernt JWT → Nutzer gilt als ausgeloggt
function logout() {
  localStorage.removeItem("token");
  showStatusMessage("success", "Erfolgreich abgemeldet");

  setTimeout(() => {
    checkSession();
    hideStatusMessage();
  }, 1000);
}

// === UTILITY FUNCTIONS ===

// Loading Animation anzeigen/verstecken
function showLoading(show) {
  const loading = document.getElementById("loading");
  loading.style.display = show ? "block" : "none";
}

// Status Message anzeigen
function showStatusMessage(type, message) {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.style.display = "block";
  statusMessage.className = `status-message status-${type}`;
  statusMessage.innerHTML = message;
}

// Status Message verstecken
function hideStatusMessage() {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.style.display = "none";
}

// === ERROR HANDLING ===

// Global Error Handler
window.addEventListener("error", function (error) {
  console.error("JavaScript Error:", error);
  showStatusMessage("error", "❌ Ein unerwarteter Fehler ist aufgetreten.");
});

// Network Error Handler
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled Promise Rejection:", event.reason);
  showStatusMessage(
    "error",
    "❌ Netzwerkfehler. Bitte Internetverbindung prüfen."
  );
});

// === DEBUG FUNCTIONS (nur für Development) ===

// Session Info in Console ausgeben (für Debugging)
function debugSession() {
  fetch("/session-check")
    .then((res) => res.json())
    .then((data) => console.log("Current Session:", data))
    .catch((err) => console.error("Debug Session Error:", err));
}

// Alle lokalen Storage Items anzeigen (falls später verwendet)
function debugStorage() {
  console.log("LocalStorage:", localStorage);
  console.log("SessionStorage:", sessionStorage);
}
