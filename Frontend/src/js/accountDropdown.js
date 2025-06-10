// === VERBESSERTER ACCOUNT DROPDOWN CODE ===

document.addEventListener("DOMContentLoaded", function () {
  console.log("Account Dropdown JS loaded");
  initializeAccountDropdown();
  checkSessionForNavigation();
});

// === DROPDOWN INITIALIZATION ===
function initializeAccountDropdown() {
  const dropdown = document.getElementById("accountDropdown");
  const accountBtn = document.getElementById("accountBtn");
  const userInfo = document.getElementById("userInfo");

  console.log("Initializing dropdown...", { dropdown, accountBtn, userInfo });

  // Click Events für beide Buttons
  if (accountBtn) {
    accountBtn.addEventListener("click", toggleDropdown);
  }

  if (userInfo) {
    userInfo.addEventListener("click", toggleDropdown);
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

  // Event Listeners für Dropdown-Aktionen
  setupDropdownActions();
}

// === VEREINFACHTE TOGGLE FUNCTION ===
function toggleDropdown(event) {
  event.preventDefault();
  event.stopPropagation();

  console.log("Toggle dropdown called");

  const dropdown = document.getElementById("accountDropdown");

  // Finde das aktive Dropdown basierend auf sichtbaren Buttons
  const activeDropdown = getActiveDropdownContent();

  if (!activeDropdown) {
    console.warn("Kein aktives Dropdown gefunden");
    return;
  }

  // EINFACHE TOGGLE-LOGIK
  if (activeDropdown.classList.contains("show")) {
    closeDropdown();
  } else {
    openDropdown(activeDropdown);
  }
}

// === HELPER: AKTIVES DROPDOWN FINDEN ===
function getActiveDropdownContent() {
  const accountBtn = document.getElementById("accountBtn");
  const userInfo = document.getElementById("userInfo");
  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userDropdownContent = document.getElementById("userDropdownContent");

  // Prüfe welcher Button sichtbar ist
  if (accountBtn && accountBtn.style.display !== "none") {
    return accountDropdownContent;
  } else if (userInfo && userInfo.style.display === "flex") {
    return userDropdownContent;
  }

  return null;
}

// === EINFACHE OPEN FUNCTION ===
function openDropdown(targetDropdown) {
  console.log("Opening dropdown:", targetDropdown);

  if (!targetDropdown) return;

  const dropdown = document.getElementById("accountDropdown");

  // Alle Dropdowns erst schließen
  closeDropdown();

  // Gewähltes Dropdown öffnen
  targetDropdown.style.display = "block";
  dropdown.classList.add("active");
  targetDropdown.classList.add("show");

  console.log("Dropdown opened successfully");
}

// === CLOSE FUNCTION (unverändert) ===
function closeDropdown() {
  console.log("Closing dropdown");

  const dropdown = document.getElementById("accountDropdown");
  if (!dropdown) return;

  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userDropdownContent = document.getElementById("userDropdownContent");

  dropdown.classList.remove("active");

  // Schließe alle Dropdowns
  if (accountDropdownContent) {
    accountDropdownContent.classList.remove("show");
    accountDropdownContent.style.display = "none";
  }

  if (userDropdownContent) {
    userDropdownContent.classList.remove("show");
    userDropdownContent.style.display = "none";
  }
}

// === DROPDOWN ACTIONS SETUP ===
function setupDropdownActions() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  const geschmacksprofilBtn = document.getElementById("geschmacksprofil");
  if (geschmacksprofilBtn) {
    geschmacksprofilBtn.addEventListener("click", handleGeschmacksprofil);
  }
}

// === SESSION CHECK (unverändert) ===
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
    console.log("Session check result:", data);
    updateNavigationUI(data.loggedIn, data.user);
    return data;
  } catch (error) {
    console.error("Session check error:", error);
    updateNavigationUI(false, null);
    return { loggedIn: false, user: null };
  }
}

// === NAVIGATION UI UPDATE (unverändert) ===
function updateNavigationUI(isLoggedIn, user) {
  const accountBtn = document.getElementById("accountBtn");
  const accountDropdownContent = document.getElementById(
    "accountDropdownContent"
  );
  const userInfo = document.getElementById("userInfo");
  const userDropdownContent = document.getElementById("userDropdownContent");
  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");

  console.log("Updating navigation UI:", { isLoggedIn, user });

  // Erst alle Dropdowns schließen
  closeDropdown();

  if (isLoggedIn && user) {
    // User eingeloggt
    if (accountBtn) accountBtn.style.display = "none";
    if (accountDropdownContent) {
      accountDropdownContent.style.display = "none";
      accountDropdownContent.classList.remove("show");
    }

    if (userInfo) userInfo.style.display = "flex";
    if (userDropdownContent) {
      userDropdownContent.style.display = "none";
      userDropdownContent.classList.remove("show");
    }

    // User Info aktualisieren
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();

    console.log("Navigation updated: User logged in as", user.name);
  } else {
    // User nicht eingeloggt
    if (accountBtn) accountBtn.style.display = "flex";
    if (accountDropdownContent) {
      accountDropdownContent.style.display = "none";
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

// === LOGOUT FUNCTIONALITY (unverändert) ===
async function handleLogout(event) {
  event.preventDefault();
  closeDropdown();

  if (!confirm("Bist du sicher, dass du dich abmelden möchtest?")) {
    return;
  }

  try {
    const response = await fetch("/logout", { method: "POST" });
    const result = await response.json();

    if (response.ok) {
      localStorage.removeItem("token");
      updateNavigationUI(false, null);
      showTemporaryMessage("✅ Erfolgreich abgemeldet", "success");

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

// === GESCHMACKSPROFIL FUNCTIONALITY (unverändert) ===
function handleGeschmacksprofil(event) {
  event.preventDefault();
  closeDropdown();
  window.location.href = "geschmacksprofil.html";
}

// === UTILITY FUNCTIONS (unverändert) ===
function showTemporaryMessage(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `dropdown-notification dropdown-notification-${type}`;
  notification.textContent = message;

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

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

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
