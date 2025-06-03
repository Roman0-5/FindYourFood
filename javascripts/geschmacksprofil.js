// === GESCHMACKSPROFIL FUNCTIONALITY - REST API VERSION ===

// Globale Variablen
let currentUser = null;
let userPreferences = []; // Wird von API geladen

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
    showGeschmacksprofilContent(sessionData.user);
    await loadUserPreferences();
  } else {
    showLoginRequired();
  }

  setupEventListeners();
}

// GET /session-check
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

  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay && user) {
    userNameDisplay.textContent = user.name;
  }
}

// === EVENT LISTENERS ===

function setupEventListeners() {
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", addCategory);
  }

  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        addCategory();
      }
    });
  }

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

// === REST API CALLS ===

// GET /api/preferences
async function loadUserPreferences() {
  try {
    const response = await fetch("/api/preferences", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences = data.preferences || [];
      updatePreferencesDisplay();
      updateRecommendations();
    }
  } catch (error) {
    console.error("Load preferences error:", error);
    showStatusMessage("error", "❌ Fehler beim Laden der Präferenzen");
    userPreferences = [];
  }
}

// POST /api/preferences
async function addCategory() {
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

  try {
    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cuisine_type: selectedCategory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences.push(selectedCategory);
      updatePreferencesDisplay();
      updateRecommendations();
      categorySelect.value = "";

      const categoryName =
        categoryMapping[selectedCategory] || selectedCategory;
      showStatusMessage("success", `✅ ${categoryName} hinzugefügt!`);
    }
  } catch (error) {
    console.error("Add category error:", error);
    showStatusMessage("error", "❌ Fehler beim Hinzufügen der Küche");
  }
}

// DELETE /api/preferences/:cuisine
async function removeCategory(category) {
  if (
    !confirm(`Möchtest du "${categoryMapping[category]}" wirklich entfernen?`)
  ) {
    return;
  }

  try {
    const response = await fetch(
      `/api/preferences/${encodeURIComponent(category)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences = userPreferences.filter((pref) => pref !== category);
      updatePreferencesDisplay();
      updateRecommendations();

      const categoryName = categoryMapping[category] || category;
      showStatusMessage("info", `ℹ️ ${categoryName} entfernt.`);
    }
  } catch (error) {
    console.error("Remove category error:", error);
    showStatusMessage("error", "❌ Fehler beim Entfernen der Küche");
  }
}

// PUT /api/preferences
async function saveProfile() {
  if (!currentUser) {
    showStatusMessage(
      "error",
      "❌ Du musst angemeldet sein um das Profil zu speichern."
    );
    return;
  }

  try {
    const response = await fetch("/api/preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preferences: userPreferences,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      showStatusMessage(
        "success",
        "💾 Geschmacksprofil erfolgreich gespeichert!"
      );
    }
  } catch (error) {
    console.error("Save profile error:", error);
    showStatusMessage("error", "❌ Fehler beim Speichern des Profils.");
  }
}

// DELETE /api/preferences
async function resetProfile() {
  if (
    !confirm("Möchtest du wirklich alle deine Lieblings-Küchen zurücksetzen?")
  ) {
    return;
  }

  try {
    const response = await fetch("/api/preferences", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences = [];
      updatePreferencesDisplay();
      updateRecommendations();
      showStatusMessage("info", "🔄 Geschmacksprofil wurde zurückgesetzt.");
    }
  } catch (error) {
    console.error("Reset profile error:", error);
    showStatusMessage("error", "❌ Fehler beim Zurücksetzen des Profils.");
  }
}

// GET /api/preferences/export
async function exportProfile() {
  if (userPreferences.length === 0) {
    showStatusMessage(
      "warning",
      "⚠️ Dein Profil ist leer. Füge erst Lieblings-Küchen hinzu."
    );
    return;
  }

  try {
    const response = await fetch("/api/preferences/export", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

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
  } catch (error) {
    console.error("Export profile error:", error);
    showStatusMessage("error", "❌ Fehler beim Exportieren des Profils.");
  }
}

// === UI FUNCTIONS ===

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

  if (userPreferences.length >= 3) {
    recommendations.push({
      title: "🌍 Fusion-Küche",
      description:
        "Da du verschiedene Küchen magst, könnten Fusion-Restaurants perfekt für dich sein!",
    });
  }

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

  return recommendations.slice(0, 4);
}

// === UTILITY FUNCTIONS ===

function showStatusMessage(type, message) {
  const statusMessage = document.getElementById("statusMessage");
  if (!statusMessage) return;

  statusMessage.style.display = "block";
  statusMessage.className = `status-message status-${type}`;
  statusMessage.innerHTML = message;

  statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}

// === PUBLIC API ===

function getPreferencesForSearch() {
  return userPreferences;
}

window.getUserPreferences = function () {
  return userPreferences;
};

function notifyPreferencesChanged() {
  const event = new CustomEvent("preferencesChanged", {
    detail: { preferences: userPreferences },
  });
  window.dispatchEvent(event);
}

// === DEBUG FUNCTIONS ===

window.debugGeschmacksprofil = {
  showPreferences: () => console.log("Preferences:", userPreferences),
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
