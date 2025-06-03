// === GESCHMACKSPROFIL FUNCTIONALITY ===

// Globale Variablen
let currentUser = null;
let userPreferences = ["italian", "japanese"]; // Beispiel-Daten (später aus Session/DB)

// Kategorie-Mapping für bessere Anzeige
const categoryMapping = {
  italian: "🍝 Italienisch",
  japanese: "🍣 Japanisch",
  chinese: "🥢 Chinesisch",
  indian: "🍛 Indisch",
  mexican: "🌮 Mexikanisch",
  thai: "🍜 Thailändisch",
  french: "🥐 Französisch",
  greek: "🥙 Griechisch",
  korean: "🍳 Koreanisch",
  vietnamese: "🍲 Vietnamesisch",
  turkish: "🥙 Türkisch",
  spanish: "🥘 Spanisch",
  american: "🍔 Amerikanisch",
  vegetarian: "🥗 Vegetarisch",
  vegan: "🌱 Vegan",
  seafood: "🐟 Meeresfrüchte",
  barbecue: "🔥 Grill/BBQ",
  fastfood: "🍟 Fast Food",
  dessert: "🍰 Desserts",
  cafe: "☕ Café",
};

// Beim Laden der Seite
document.addEventListener("DOMContentLoaded", function () {
  console.log("Geschmacksprofil JS loaded");
  initializeGeschmacksprofil();
});

// === INITIALIZATION ===

async function initializeGeschmacksprofil() {
  // Prüfe Session
  const sessionData = await checkSession();

  if (sessionData.loggedIn) {
    // User ist eingeloggt
    showGeschmacksprofilContent(sessionData.user);
    loadUserPreferences(sessionData.user);
  } else {
    // User ist nicht eingeloggt
    showLoginRequired();
  }

  // Event Listeners initialisieren
  setupEventListeners();
}

async function checkSession() {
  try {
    const response = await fetch("/session-check");
    const data = await response.json();
    currentUser = data.user;
    return data;
  } catch (error) {
    console.error("Session check error:", error);
    return { loggedIn: false, user: null };
  }
}

// === UI DISPLAY FUNCTIONS ===

function showLoginRequired() {
  document.getElementById("loginRequired").style.display = "block";
  document.getElementById("geschmacksprofilContent").style.display = "none";
}

function showGeschmacksprofilContent(user) {
  document.getElementById("loginRequired").style.display = "none";
  document.getElementById("geschmacksprofilContent").style.display = "block";

  // Update user name
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay && user) {
    userNameDisplay.textContent = user.name;
  }
}

// === EVENT LISTENERS ===

function setupEventListeners() {
  // Add Category Button
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", addCategory);
  }

  // Category Select (Enter key)
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        addCategory();
      }
    });
  }

  // Profile Action Buttons
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", saveProfile);
  }

  const resetProfileBtn = document.getElementById("resetProfileBtn");
  if (resetProfileBtn) {
    resetProfileBtn.addEventListener("click", resetProfile);
  }

  const exportProfileBtn = document.getElementById("exportProfileBtn");
  if (exportProfileBtn) {
    exportProfileBtn.addEventListener("click", exportProfile);
  }
}

// === PREFERENCES MANAGEMENT ===

function loadUserPreferences(user) {
  // Hier würdest du später die Präferenzen aus der Datenbank laden
  // Für jetzt verwenden wir die Beispiel-Daten
  console.log("Loading preferences for user:", user.name);

  updatePreferencesDisplay();
  updateRecommendations();
}

function updatePreferencesDisplay() {
  const container = document.getElementById("currentPreferences");
  const emptyState = document.getElementById("emptyState");

  if (!container) return;

  if (userPreferences.length === 0) {
    container.style.display = "none";
    emptyState.style.display = "block";
  } else {
    container.style.display = "grid";
    emptyState.style.display = "none";

    container.innerHTML = userPreferences
      .map(
        (category) => `
            <div class="preference-item">
                <span class="preference-name">${
                  categoryMapping[category] || category
                }</span>
                <button class="remove-btn" data-category="${category}" onclick="removeCategory('${category}')">❌</button>
            </div>
        `
      )
      .join("");
  }
}

function addCategory() {
  const categorySelect = document.getElementById("categorySelect");
  const selectedCategory = categorySelect.value;

  if (!selectedCategory) {
    showStatusMessage("error", "❌ Bitte wähle eine Küche aus.");
    return;
  }

  if (userPreferences.includes(selectedCategory)) {
    showStatusMessage(
      "warning",
      "⚠️ Diese Küche ist bereits in deinen Favoriten."
    );
    return;
  }

  // Kategorie hinzufügen
  userPreferences.push(selectedCategory);

  // UI aktualisieren
  updatePreferencesDisplay();
  updateRecommendations();

  // Select zurücksetzen
  categorySelect.value = "";

  // Feedback
  const categoryName = categoryMapping[selectedCategory] || selectedCategory;
  showStatusMessage(
    "success",
    `✅ ${categoryName} zu deinen Favoriten hinzugefügt!`
  );
}

function removeCategory(category) {
  if (
    !confirm(
      `Möchtest du "${categoryMapping[category]}" wirklich aus deinen Favoriten entfernen?`
    )
  ) {
    return;
  }

  // Kategorie entfernen
  userPreferences = userPreferences.filter((pref) => pref !== category);

  // UI aktualisieren
  updatePreferencesDisplay();
  updateRecommendations();

  // Feedback
  const categoryName = categoryMapping[category] || category;
  showStatusMessage(
    "info",
    `ℹ️ ${categoryName} aus deinen Favoriten entfernt.`
  );
}

// === RECOMMENDATIONS ===

function updateRecommendations() {
  const recommendationCards = document.getElementById("recommendationCards");
  const noRecommendations = document.getElementById("noRecommendations");

  if (!recommendationCards || !noRecommendations) return;

  if (userPreferences.length === 0) {
    recommendationCards.style.display = "none";
    noRecommendations.style.display = "block";
    return;
  }

  recommendationCards.style.display = "grid";
  noRecommendations.style.display = "none";

  // Generiere Empfehlungen basierend auf Präferenzen
  const recommendations = generateRecommendations();

  recommendationCards.innerHTML = recommendations
    .map(
      (rec) => `
        <div class="recommendation-card">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        </div>
    `
    )
    .join("");
}

function generateRecommendations() {
  const recommendations = [];

  // Empfehlungen basierend auf Präferenzen
  if (userPreferences.includes("japanese")) {
    recommendations.push({
      title: "🍣 Sushi-Restaurants in Wien",
      description:
        "Entdecke authentische japanische Küche in deiner Nähe. Perfekt für deine Vorliebe für japanisches Essen!",
    });
  }

  if (userPreferences.includes("italian")) {
    recommendations.push({
      title: "🍝 Italienische Perlen",
      description:
        "Von Pasta bis Pizza - finde die besten italienischen Restaurants, die zu deinem Geschmack passen.",
    });
  }

  if (userPreferences.includes("indian")) {
    recommendations.push({
      title: "🍛 Indische Gewürze",
      description:
        "Scharfe Currys und aromatische Gewürze warten auf dich in den besten indischen Lokalen.",
    });
  }

  if (userPreferences.includes("mexican")) {
    recommendations.push({
      title: "🌮 Mexikanische Fiesta",
      description:
        "Tacos, Burritos und mehr - erlebe die Vielfalt der mexikanischen Küche.",
    });
  }

  // Allgemeine Empfehlungen wenn viele Präferenzen
  if (userPreferences.length >= 3) {
    recommendations.push({
      title: "🌍 Fusion-Küche",
      description:
        "Da du verschiedene Küchen magst, könnten Fusion-Restaurants perfekt für dich sein!",
    });
  }

  // Neue Küchen vorschlagen
  const notSelected = Object.keys(categoryMapping).filter(
    (cat) => !userPreferences.includes(cat)
  );
  if (notSelected.length > 0) {
    const randomCuisine =
      notSelected[Math.floor(Math.random() * notSelected.length)];
    recommendations.push({
      title: `✨ Neu entdecken: ${categoryMapping[randomCuisine]}`,
      description: "Erweitere deinen Horizont und probiere etwas Neues aus!",
    });
  }

  return recommendations.slice(0, 4); // Maximal 4 Empfehlungen
}

// === PROFILE ACTIONS ===

async function saveProfile() {
  if (!currentUser) {
    showStatusMessage(
      "error",
      "❌ Du musst angemeldet sein um das Profil zu speichern."
    );
    return;
  }

  try {
    // Hier würdest du später an deine API senden
    // const response = await fetch('/api/profile/preferences', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ preferences: userPreferences })
    // });

    // Simulation für jetzt
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showStatusMessage(
      "success",
      "💾 Geschmacksprofil erfolgreich gespeichert!"
    );
    console.log("Saved preferences:", userPreferences);
  } catch (error) {
    console.error("Save profile error:", error);
    showStatusMessage("error", "❌ Fehler beim Speichern des Profils.");
  }
}

function resetProfile() {
  if (
    !confirm("Möchtest du wirklich alle deine Lieblings-Küchen zurücksetzen?")
  ) {
    return;
  }

  userPreferences = [];
  updatePreferencesDisplay();
  updateRecommendations();

  showStatusMessage("info", "🔄 Geschmacksprofil wurde zurückgesetzt.");
}

function exportProfile() {
  if (userPreferences.length === 0) {
    showStatusMessage(
      "warning",
      "⚠️ Dein Profil ist leer. Füge erst Lieblings-Küchen hinzu."
    );
    return;
  }

  const profileData = {
    user: currentUser ? currentUser.name : "Unbekannt",
    preferences: userPreferences.map((pref) => ({
      id: pref,
      name: categoryMapping[pref] || pref,
    })),
    exportDate: new Date().toISOString(),
    totalPreferences: userPreferences.length,
  };

  // JSON-Datei erstellen und downloaden
  const dataStr = JSON.stringify(profileData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `geschmacksprofil_${currentUser?.name || "user"}_${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showStatusMessage("success", "📤 Geschmacksprofil erfolgreich exportiert!");
}

// === UTILITY FUNCTIONS ===

function showStatusMessage(type, message) {
  const statusMessage = document.getElementById("statusMessage");
  if (!statusMessage) return;

  statusMessage.style.display = "block";
  statusMessage.className = `status-message status-${type}`;
  statusMessage.innerHTML = message;

  // Scroll to message
  statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}

// === INTEGRATION MIT SEARCH ===

// Diese Funktion kann später verwendet werden um Suche zu personalisieren
function getPreferencesForSearch() {
  return userPreferences;
}

// Diese Funktion kann von anderen Seiten aufgerufen werden
window.getUserPreferences = function () {
  return userPreferences;
};

// Event für andere Teile der App
function notifyPreferencesChanged() {
  const event = new CustomEvent("preferencesChanged", {
    detail: { preferences: userPreferences },
  });
  window.dispatchEvent(event);
}

// === ERWEITERTE FUNKTIONEN (für später) ===

// Präferenzen basierend auf Suchhistorie vorschlagen
function suggestPreferencesFromHistory() {
  // Placeholder für zukünftige Implementierung
  console.log("Analyzing search history for suggestions...");
}

// Restaurant-Bewertungen in Empfehlungen einbeziehen
function getPersonalizedRestaurantRecommendations() {
  // Placeholder für zukünftige API-Integration
  console.log("Getting personalized restaurant recommendations...");
}

// === DEBUG FUNCTIONS ===

// Debug: Aktuelle Präferenzen anzeigen
function debugPreferences() {
  console.log("=== GESCHMACKSPROFIL DEBUG ===");
  console.log("Current User:", currentUser);
  console.log("User Preferences:", userPreferences);
  console.log("Available Categories:", Object.keys(categoryMapping));
}

// Debug-Funktionen für Development
window.debugGeschmacksprofil = {
  showPreferences: debugPreferences,
  addTestPreferences: () => {
    userPreferences = ["italian", "japanese", "indian", "mexican"];
    updatePreferencesDisplay();
    updateRecommendations();
  },
  clearPreferences: () => {
    userPreferences = [];
    updatePreferencesDisplay();
    updateRecommendations();
  },
};
