// === ACCOUNT DROPDOWN FUNCTIONALITY ===

document.addEventListener("DOMContentLoaded", function () {
  console.log("Account Dropdown JS loaded"); // Debug
  initializeAccountDropdown();
  checkSessionForNavigation();
});

// === DROPDOWN INITIALIZATION ===

function initializeAccountDropdown() {
  const dropdown = document.getElementById("accountDropdown");
  const accountBtn = document.getElementById("accountBtn");
  const userInfo = document.getElementById("userInfo");

  console.log("Initializing dropdown...", { dropdown, accountBtn, userInfo }); // Debug

  // Click Event für Account Button
  if (accountBtn) {
    accountBtn.addEventListener("click", function (event) {
      console.log("Account button clicked"); // Debug
      toggleDropdown(event);
    });
  }

  // Click Event für User Info (wenn eingeloggt)
  if (userInfo) {
    userInfo.addEventListener("click", function (event) {
      console.log("User info clicked"); // Debug
      toggleDropdown(event);
    });
  }

  // Schließe Dropdown wenn außerhalb geklickt wird
  document.addEventListener("click", function (event) {
    if (dropdown && !dropdown.contains(event.target)) {
      closeDropdown();
    }
  });

  // ESC Taste zum Schließen
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDropdown();
    }
  });

  // Logout Event
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Geschmacksprofil Event
  const geschmacksprofilBtn = document.getElementById("geschmacksprofil");
  if (geschmacksprofilBtn) {
    geschmacksprofilBtn.addEventListener("click", handleGeschmacksprofil);
  }
}

// === DROPDOWN TOGGLE FUNCTIONS ===

function toggleDropdown(event) {
  event.preventDefault();
  event.stopPropagation();

  console.log("Toggle dropdown called"); // Debug

  const dropdown = document.getElementById("accountDropdown");
  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userDropdownContent = document.getElementById("userDropdownContent");

  // Bestimme welches Dropdown aktiv ist (basierend auf Sichtbarkeit der Parent-Elemente)
  let activeDropdown = null;

  // Prüfe Account Dropdown (wenn Account Button sichtbar ist)
  const accountBtn = document.getElementById("accountBtn");
  if (accountBtn && accountBtn.style.display !== "none") {
    activeDropdown = accountDropdownContent;
  }

  // Prüfe User Dropdown (wenn User Info sichtbar ist)
  const userInfo = document.getElementById("userInfo");
  if (userInfo && userInfo.style.display === "flex") {
    activeDropdown = userDropdownContent;
  }

  console.log("Active dropdown:", activeDropdown); // Debug

  if (activeDropdown) {
    if (activeDropdown.classList.contains("show")) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }
}

function openDropdown() {
  console.log("Opening dropdown"); // Debug

  const dropdown = document.getElementById("accountDropdown");
  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userDropdownContent = document.getElementById("userDropdownContent");
  const accountBtn = document.getElementById("accountBtn");
  const userInfo = document.getElementById("userInfo");

  // Bestimme welches Dropdown geöffnet werden soll
  let targetDropdown = null;

  // NEUE LOGIK: Prüfe welcher Button/Info sichtbar ist
  if (accountBtn && accountBtn.style.display !== "none") {
    // Account Button ist sichtbar -> Account Dropdown öffnen
    targetDropdown = accountDropdownContent;
  } else if (userInfo && userInfo.style.display === "flex") {
    // User Info ist sichtbar -> User Dropdown öffnen
    targetDropdown = userDropdownContent;
  }

  if (targetDropdown && dropdown) {
    // Setze display auf block um !important zu überschreiben
    targetDropdown.style.display = "block";

    dropdown.classList.add("active");
    targetDropdown.classList.add("show");
    console.log("Dropdown opened:", targetDropdown); // Debug
  }
}

function closeDropdown() {
  console.log("Closing dropdown"); // Debug

  const dropdown = document.getElementById("accountDropdown");
  if (!dropdown) return;

  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userDropdownContent = document.getElementById("userDropdownContent");

  dropdown.classList.remove("active");

  // Schließe alle Dropdowns komplett
  if (accountDropdownContent) {
    accountDropdownContent.classList.remove("show");
    accountDropdownContent.style.display = "none";
  }

  if (userDropdownContent) {
    userDropdownContent.classList.remove("show");
    userDropdownContent.style.display = "none";
  }
}

// === SESSION CHECK FÜR NAVIGATION ===

async function checkSessionForNavigation() {
  try {
    const res = await fetch("/me", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!res.ok) {
      console.warn("Session check fehlgeschlagen mit Status:", res.status);
      updateNavigationUI(false, null);
      return { loggedIn: false, user: null };
    }

    const data = await res.json();
    const isLoggedIn = data.loggedIn;

    console.log("Session check result:", data); // Debug
    updateNavigationUI(isLoggedIn, data.user);
    return data;

  } catch (error) {
    console.error("Session check error:", error);
    updateNavigationUI(false, null);
    return { loggedIn: false, user: null };
  }
}

function updateNavigationUI(isLoggedIn, user) {
  const accountBtn = document.getElementById("accountBtn");
  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userInfo = document.getElementById("userInfo");
  const userDropdownContent = document.getElementById("userDropdownContent");
  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");

  console.log("Updating navigation UI:", { isLoggedIn, user }); // Debug

  // ERST ALLE DROPDOWNS SCHLIESSEN UND VERSTECKEN
  closeDropdown();

  if (isLoggedIn && user) {
    // User ist eingeloggt - zeige User Info
    if (accountBtn) accountBtn.style.display = "none";
    if (accountDropdownContent) {
      accountDropdownContent.style.display = "none";
      accountDropdownContent.classList.remove("show");
    }

    if (userInfo) userInfo.style.display = "flex";
    if (userDropdownContent) {
      userDropdownContent.style.display = "none"; // Bereit aber VERSTECKT
      userDropdownContent.classList.remove("show");
    }

    // Update User Info
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();

    console.log("Navigation updated: User logged in as", user.name);
  } else {
    // User ist nicht eingeloggt - zeige Account Button
    if (accountBtn) accountBtn.style.display = "flex";
    if (accountDropdownContent) {
      accountDropdownContent.style.display = "none"; // VERSTECKT bis Klick
      accountDropdownContent.classList.remove("show");
    }

    if (userInfo) userInfo.style.display = "none";
    if (userDropdownContent) {
      userDropdownContent.style.display = "none";
      userDropdownContent.classList.remove("show");
    }

    console.log("Navigation updated: User not logged in");
  }
}

// === LOGOUT FUNCTIONALITY ===

async function handleLogout(event) {
  event.preventDefault();
  closeDropdown();

  try {
    const response = await fetch("/logout", { method: "POST" });
    const result = await response.json();

    if (response.ok) {
      // Erfolgreich abgemeldet
      updateNavigationUI(false, null);

      // Optional: Feedback anzeigen
      showTemporaryMessage("✅ Erfolgreich abgemeldet", "success");

      // Optional: Zur Startseite weiterleiten (nur wenn nicht bereits dort)
      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.includes("StartSite") &&
        !window.location.pathname.includes("index")
      ) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } else {
      showTemporaryMessage("❌ Fehler beim Abmelden", "error");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showTemporaryMessage("❌ Verbindungsfehler beim Abmelden", "error");
  }
}

// === GESCHMACKSPROFIL FUNCTIONALITY ===

function handleGeschmacksprofil(event) {
  event.preventDefault();
  closeDropdown();

  // Weiterleitung zur Geschmacksprofil-Seite
  window.location.href = "geschmacksprofil.html";
}

// === UTILITY FUNCTIONS ===

// Temporäre Nachrichten anzeigen
function showTemporaryMessage(message, type = "info") {
  // Erstelle Notification Element
  const notification = document.createElement("div");
  notification.className = `dropdown-notification dropdown-notification-${type}`;
  notification.textContent = message;

  // Styling
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: getNotificationColor(type),
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    zIndex: "10000",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    transform: "translateX(400px)",
    transition: "transform 0.3s ease",
    fontFamily: "sans-serif",
  });

  // Zur Seite hinzufügen
  document.body.appendChild(notification);

  // Einblenden
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Ausblenden und entfernen
  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Notification Farben
function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "#28a745";
    case "error":
      return "#dc3545";
    case "warning":
      return "#ffc107";
    case "info":
    default:
      return "#17a2b8";
  }
}
