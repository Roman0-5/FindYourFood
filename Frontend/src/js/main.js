// === MAIN.JS - SEARCH FORM ROUTING ===

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔍 Main.js loaded - Search form setup");
  setupSearchForm();
});

// === SEARCH FORM SETUP ===
function setupSearchForm() {
  const searchForm = document.querySelector(".search-form");
  if (!searchForm) {
    console.log("ℹ️ Keine .search-form gefunden");
    return;
  }

  searchForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Form-Daten sammeln
    const query = searchForm.querySelector('input[name="query"]').value.trim();
    const city = searchForm.querySelector('input[name="city"]').value.trim();
    const openingHours = searchForm.querySelector(
      'select[name="openingHours"]'
    ).value;
    const category = searchForm.querySelector('select[name="category"]').value;
    const limit = searchForm.querySelector('input[name="limit"]').value;

    // Validation
    if (!query || !city) {
      alert("Bitte gib sowohl einen Suchbegriff als auch eine Stadt ein.");
      return;
    }

    // URL-Parameter erstellen
    const params = new URLSearchParams();
    params.append("query", query);
    params.append("city", city);
    if (openingHours) params.append("openingHours", openingHours);
    if (category) params.append("category", category);
    if (limit) params.append("limit", limit);

    // Smart Routing: Prüfe ob User eingeloggt ist
    const token = localStorage.getItem("token");

    if (token) {
      // User eingeloggt -> UserSearch mit Empfehlungen
      console.log("👤 Routing to UserSearch (logged in)");
      window.location.href = `userSearch.html?${params.toString()}`;
    } else {
      // Gast -> normale Results
      console.log("👥 Routing to Results (guest)");
      window.location.href = `Results.html?${params.toString()}`;
    }
  });
}
