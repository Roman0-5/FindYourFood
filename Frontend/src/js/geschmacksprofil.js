// === GESCHMACKSPROFIL FUNCTIONALITY - REST API VERSION ===

// Globale Variablen
let currentUser = null;
let userPreferences = []; // Wird von API geladen
const container = document.getElementById("recommendationArea");

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
    await loadRecommendation();
  } else {
    showLoginRequired();
  }

  setupEventListeners();
}

// JWT Session Check - KORRIGIERT!
async function checkSession() {
  try {
    const token = localStorage.getItem("token"); // <- "token" nicht "authToken"
    console.log("🔍 Token aus localStorage:", token);

    if (!token) {
      console.log("❌ Kein Token gefunden");
      return { loggedIn: false, user: null };
    }

    console.log("📡 Sende Request an /me mit Token");

    const response = await fetch("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📨 Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ User Data erhalten:", data);
      currentUser = data.user;
      return { loggedIn: true, user: data.user };
    } else {
      console.log("❌ Token ungültig, entferne aus localStorage");
      localStorage.removeItem("token");
      return { loggedIn: false, user: null };
    }
  } catch (error) {
    console.error("❌ Session check error:", error);
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

// === HELPER FUNCTION FOR AUTH HEADERS ===
function getAuthHeaders() {
  const token = localStorage.getItem("token"); // <- "token" nicht "authToken"
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// === REST API CALLS ===

// GET /api/preferences
async function loadUserPreferences() {
  try {
    const response = await fetch("/api/preferences", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences = data.preferences || [];
      updatePreferencesDisplay();
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
      headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences = userPreferences.filter((pref) => pref !== category);
      updatePreferencesDisplay();
      

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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      userPreferences = [];
      updatePreferencesDisplay();
      
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
      headers: getAuthHeaders(),
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

async function loadRecommendation() {
  const container = document.getElementById("recommendationArea");
  container.innerHTML = ""; // Vorherige Inhalte löschen

  try {
    const res = await fetch("/api/recommendation", {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.restaurant) {
      container.style.display = "none"; // ❌ Recommendation verstecken
      return;
    }

    const { restaurant, cuisine } = data;
    const { poi, address } = restaurant;

    container.innerHTML = `
      <div class="recommendation-card">
        <h4>🔍 Empfehlung für dich: ${categoryMapping[cuisine] || cuisine}</h4>
        <p><strong>${poi.name}</strong></p>
        <p>${address?.freeformAddress || "Adresse nicht verfügbar"}</p>
        <p>${poi.phone || "Keine Telefonnummer"}</p>
        <p><em>${poi.categories?.[0] || "Unbekannte Kategorie"}</em></p>
      </div>
    `;

    container.style.display = "block"; // ✅ Nur anzeigen wenn erfolgreich
  } catch (error) {
    console.error("❌ Fehler bei der Empfehlung:", error);
    container.style.display = "none"; // ❌ Auch bei Fehler verstecken
  }
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
    
  },
  clearPreferences: () => {
    userPreferences = [];
    updatePreferencesDisplay();
    
  },
};
