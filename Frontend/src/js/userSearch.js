// === USER SEARCH FUNCTIONALITY ===

let currentUser = null;
let userPreferences = [];

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔍 UserSearch JS loaded");

  // Session prüfen
  const sessionData = await checkSession();

  if (sessionData.loggedIn) {
    await initializeUserSearch(sessionData.user);
  } else {
    showLoginRequired();
  }
});

// === SESSION CHECK ===
async function checkSession() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return { loggedIn: false, user: null };
    }

    const response = await fetch("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      return { loggedIn: true, user: data.user };
    } else {
      localStorage.removeItem("token");
      return { loggedIn: false, user: null };
    }
  } catch (error) {
    console.error("❌ Session check error:", error);
    return { loggedIn: false, user: null };
  }
}

// === INITIALIZATION ===
async function initializeUserSearch(user) {
  console.log("✅ User authenticated:", user.name);

  // UI anzeigen
  document.getElementById("loginRequired").style.display = "none";
  document.getElementById("userSearchContent").style.display = "block";

  // Benutzername anzeigen
  const userNameSpan = document.getElementById("userNameSpan");
  if (userNameSpan) {
    userNameSpan.textContent = `(${user.name})`;
  }

  // URL-Parameter für Suchanfrage
  const params = new URLSearchParams(window.location.search);
  console.log("🔍 URL Parameters:", Object.fromEntries(params));
  updateSearchQuery(params);

  // Parallel laden: Präferenzen + beide Suchtypen
  console.log("🚀 Starting parallel loading...");

  try {
    await loadUserPreferences();
    console.log("✅ Preferences loaded, starting searches...");

    await Promise.all([
      loadPersonalizedRecommendations(params),
      loadRegularSearchResultsSimple(params),
    ]);

    console.log("✅ All searches completed");
  } catch (error) {
    console.error("❌ Error in parallel loading:", error);
  }
}

function showLoginRequired() {
  document.getElementById("loginRequired").style.display = "block";
  document.getElementById("userSearchContent").style.display = "none";
}

// === URL PARAMETER HANDLING ===
function updateSearchQuery(params) {
  const query = params.get("query") || "";
  const city = params.get("city") || "";

  const searchQueryElement = document.getElementById("searchQuery");
  if (searchQueryElement && (query || city)) {
    searchQueryElement.textContent = `für "${query}" in ${city}`;
  }
}

// === AUTH HEADERS ===
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// === LOAD USER PREFERENCES ===
async function loadUserPreferences() {
  console.log("🔄 Loading user preferences...");

  try {
    const response = await fetch("/api/preferences", {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      userPreferences = data.preferences || [];
      console.log("✅ User preferences loaded:", userPreferences);
    } else {
      console.error("❌ Failed to load preferences");
      userPreferences = [];
    }
  } catch (error) {
    console.error("❌ Error loading preferences:", error);
    userPreferences = [];
  }
}

// === LOAD PERSONALIZED RECOMMENDATIONS ===
async function loadPersonalizedRecommendations(params) {
  console.log("⭐ === STARTING RECOMMENDATIONS ===");

  const container = document.getElementById("recommendationsContainer");
  console.log("📦 Recommendations container found:", !!container);

  if (!container) {
    console.error("❌ recommendationsContainer not found!");
    return;
  }

  console.log("👤 User preferences:", userPreferences);

  try {
    if (!userPreferences || userPreferences.length === 0) {
      console.log("⚠️ No user preferences found");
      container.innerHTML = `
                <div class="empty-state">
                    <h3>🤷‍♀️ Keine Empfehlungen verfügbar</h3>
                    <p>Du hast noch keine Präferenzen gesetzt.</p>
                    <p>Füge Lieblings-Küchen in deinem <a href="geschmacksprofil.html" style="color: #70311C;">Geschmacksprofil</a> hinzu, um personalisierte Empfehlungen zu erhalten.</p>
                </div>
            `;
      return;
    }

    console.log("🔍 Getting recommendations for preferences:", userPreferences);
    const recommendations = await getMultipleRecommendations(params);
    console.log("📊 Got recommendations:", recommendations.length);

    if (recommendations.length === 0) {
      console.log("⚠️ No recommendations found");
      container.innerHTML = `
                <div class="empty-state">
                    <h3>😔 Keine Empfehlungen gefunden</h3>
                    <p>Keine passenden Restaurants für deine Präferenzen gefunden.</p>
                    <p>Versuche es später erneut oder ändere deine Präferenzen.</p>
                </div>
            `;
      return;
    }

    console.log("🎨 Rendering recommendations...");
    container.innerHTML = `<div class="recommendations-grid"></div>`;
    const grid = container.querySelector(".recommendations-grid");

    recommendations.forEach((rec, index) => {
      console.log(
        `📝 Rendering recommendation ${index + 1}:`,
        rec.poi.name,
        `(${rec.cuisineType})`
      );
      const card = createRecommendationCard(rec);
      grid.appendChild(card);
    });

    console.log(
      `✅ Successfully rendered ${recommendations.length} recommendations`
    );
  } catch (error) {
    console.error("❌ Error loading recommendations:", error);
    container.innerHTML = `
            <div class="empty-state">
                <h3>❌ Fehler beim Laden der Empfehlungen</h3>
                <p>Fehler: ${error.message}</p>
                <p>Versuche es später erneut.</p>
            </div>
        `;
  }
}

// === GET MULTIPLE RECOMMENDATIONS ===
async function getMultipleRecommendations(params) {
  const city = params.get("city") || "Wien";
  const recommendations = [];

  // Für jede Präferenz eine Empfehlung holen (max 3)
  const prefsToUse = userPreferences.slice(0, 3);

  for (const cuisine of prefsToUse) {
    try {
      // 🔥 RANDOMIZATION: Hole mehr Ergebnisse und wähle zufällig
      const randomLimit = Math.floor(Math.random() * 5) + 3; // 3-7 Ergebnisse
      const url = `/search?query=${encodeURIComponent(
        cuisine + " restaurant"
      )}&city=${encodeURIComponent(city)}&limit=${randomLimit}`;
      console.log(
        `🔍 Recommendation search for ${cuisine} (limit: ${randomLimit}):`,
        url
      );

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // 🎲 Wähle zufälliges Restaurant aus den Ergebnissen
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const selectedResult = data.results[randomIndex];

        recommendations.push({
          ...selectedResult,
          cuisineType: cuisine,
          isRecommendation: true,
        });

        console.log(
          `✅ Added random recommendation ${randomIndex + 1}/${
            data.results.length
          }: ${selectedResult.poi.name}`
        );
      }
    } catch (error) {
      console.error(`❌ Error getting recommendation for ${cuisine}:`, error);
    }
  }

  // 🎲 Shuffle the final recommendations array for extra randomness
  return shuffleArray(recommendations);
}

// === CREATE RECOMMENDATION CARD ===
function createRecommendationCard(result) {
  const { poi, address } = result;
  const cuisineMapping = {
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

  const card = document.createElement("div");
  card.classList.add("recommendation-card");

  card.innerHTML = `
        <div class="recommendation-badge">
            ${cuisineMapping[result.cuisineType] || result.cuisineType}
        </div>
        <h3>${poi.name}</h3>
        <p>${poi.phone || "Keine Telefonnummer"}</p>
        <p>${address.freeformAddress}</p>
        <p><strong>Kategorie:</strong> ${poi.categories?.[0] || "Unbekannt"}</p>
        <span class="favorite-star"
              data-name="${poi.name}"
              data-phone="${poi.phone || ""}"
              data-address="${address.freeformAddress}"
              data-category="${poi.categories?.[0] || "Unknown"}"
        >☆</span>
    `;

  // Favoriten-Funktionalität hinzufügen
  setupFavoriteStar(card);

  return card;
}

// === SIMPLIFIED REGULAR SEARCH (using results.js logic) ===
async function loadRegularSearchResultsSimple(params) {
  console.log("🔍 === STARTING REGULAR SEARCH ===");

  const container = document.getElementById("regularResultsContainer");
  console.log("📦 Container found:", !!container);

  if (!container) {
    console.error("❌ regularResultsContainer not found!");
    return;
  }

  // URL-Parameter extrahieren (wie in results.js)
  const query = params.get("query") || "";
  const city = params.get("city") || "";
  const category = params.get("category") || "";
  const limit = params.get("limit") || "5";
  const openingHours = params.get("openingHours") || "any";

  console.log("📊 Search parameters:", {
    query,
    city,
    category,
    limit,
    openingHours,
  });

  if (!query || !city) {
    console.log("⚠️ Missing required parameters");
    container.innerHTML = `
            <div class="empty-state">
                <h3>🔍 Keine Suchparameter</h3>
                <p>Query: "${query}", City: "${city}"</p>
                <p>Gehe zur <a href="StartSite.html" style="color: #70311C;">Startseite</a> um eine neue Suche zu starten.</p>
            </div>
        `;
    return;
  }

  // 🔥 EXACT SAME LOGIC as results.js
  const url = `/search?query=${query}&city=${city}&limit=${limit}&category=${category}&openingHours=${openingHours}`;
  console.log("🌐 API URL:", url);

  // Loading indicator
  container.innerHTML = `
        <div class="empty-state">
            <h3>🔄 Lade Suchergebnisse...</h3>
            <p>Suche nach "${query}" in "${city}"</p>
        </div>
    `;

  try {
    console.log("📡 Sending API request...");
    const response = await fetch(url);
    console.log("📨 Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📊 API Response:", data);
    console.log("📊 Results count:", data.results ? data.results.length : 0);

    if (!data.results || data.results.length === 0) {
      console.log("⚠️ No results found");
      container.innerHTML = `
                <div class="empty-state">
                    <h3>😔 Keine Ergebnisse gefunden</h3>
                    <p>Keine Restaurants für "${query}" in "${city}" gefunden.</p>
                    <p>Versuche es mit anderen Suchbegriffen.</p>
                </div>
            `;
      return;
    }

    // Container leeren
    console.log("🧹 Clearing container and rendering results...");
    container.innerHTML = "";

    // 🔥 EXACT SAME RENDERING as results.js
    data.results.forEach((result, index) => {
      console.log(`📝 Rendering result ${index + 1}:`, result.poi.name);

      const { poi, address } = result;

      const element = document.createElement("div");
      element.classList.add("result-card");
      element.innerHTML = `
                <h3>${poi.name}</h3>
                <p>${poi.phone || "Keine Telefonnummer"}</p>
                <p>${address.freeformAddress}</p>
                <p><strong>Kategorie:</strong> ${
                  poi.categories?.[0] || "Unbekannt"
                }</p>
                <span class="favorite-star"
                      data-name="${poi.name}"
                      data-phone="${poi.phone || ""}"
                      data-address="${address.freeformAddress}"
                      data-category="${poi.categories?.[0] || "Unknown"}"
                >☆</span>
            `;
      container.appendChild(element);

      // 🔥 EXACT SAME FAVORITES LOGIC as results.js
      setupFavoriteStar(element);
    });

    console.log(
      `✅ Successfully rendered ${data.results.length} regular results`
    );
  } catch (error) {
    console.error("❌ Error in regular search:", error);
    container.innerHTML = `
            <div class="empty-state">
                <h3>❌ Fehler beim Laden</h3>
                <p>Fehler: ${error.message}</p>
                <p>URL: ${url}</p>
                <p>Versuche es später erneut.</p>
            </div>
        `;
  }
}

// === FAVORITES FUNCTIONALITY (same as results.js) ===
function setupFavoriteStar(card) {
  const star = card.querySelector(".favorite-star");
  if (!star) return;

  // 🔥 EXACT SAME LOGIC as results.js
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const item = {
    name: star.dataset.name,
    phone: star.dataset.phone,
    address: star.dataset.address,
    category: star.dataset.category,
  };

  const exists = favs.some(
    (f) => f.name === item.name && f.address === item.address
  );
  if (exists) {
    star.classList.add("active");
    star.textContent = "★";
  }

  star.addEventListener("click", () => {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const idx = favorites.findIndex(
      (f) => f.name === item.name && f.address === item.address
    );

    if (idx === -1) {
      favorites.push(item);
      star.classList.add("active");
      star.textContent = "★";
    } else {
      favorites.splice(idx, 1);
      star.classList.remove("active");
      star.textContent = "☆";
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  });
}

// === UTILITY FUNCTIONS ===

// Shuffle array for randomness
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
