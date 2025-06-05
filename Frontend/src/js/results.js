document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("results-container");
  
  // Überprüfe ob Container existiert
  if (!container) {
    console.error("❌ Element mit ID 'results-container' nicht gefunden!");
    return;
  }

  // 1. URL-Parameter auslesen
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query") || "";
  const city = params.get("city") || "";
  const category = params.get("category") || "";
  const limit = params.get("limit") || "5";
  const openingHours = params.get("openingHours") || "any";

  // 2. ❌ ENTFERNE DIESE ZEILEN:
  // const apiKey = process.env.API_KEY
  // const endpoint = process.env.API_URL || "https://api.tomtom.com/search/2";

  // 3. Anfrage-URL zu deinem eigenen Server
  const url = `/search?query=${query}&city=${city}&limit=${limit}&category=${category}&openingHours=${openingHours}`;

  console.log("🔍 Lade Daten von:", url); // Debug

  // 4. Fetch auf deine eigene API
  fetch(url)
    .then(res => {
      console.log("📡 Response Status:", res.status); // Debug
      return res.json();
    })
    .then(data => {
      console.log("📊 Erhaltene Daten:", data); // Debug
      
      if (!data.results || data.results.length === 0) {
        container.innerHTML = "<p>No results found. Try different search terms.</p>";
        return;
      }

      // Container leeren
      container.innerHTML = "";

      data.results.forEach(result => {
        const { poi, address } = result;

        const element = document.createElement("div");
        element.classList.add("result-card");
        element.innerHTML = `
          <h3>${poi.name}</h3>
          <p>${poi.phone || "No phone available"}</p>
          <p>${address.freeformAddress}</p>
          <p><strong>Category:</strong> ${poi.categories?.[0] || "Unknown"}</p>
        `;
        container.appendChild(element);
      });
    })
    .catch(err => {
      console.error("❌ API Error:", err);
      container.innerHTML = "<p>Something went wrong while loading results.</p>";
    });
});