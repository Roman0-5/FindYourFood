document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("results-container");

  // 1. URL-Parameter auslesen
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query") || "";
  const city = params.get("city") || "";
  const category = params.get("category") || "";
  const limit = params.get("limit") || "5";
  const openingHours = params.get("openingHours") || "any";

  // 2. Anfrage-URL zur TomTom API aufbauen
  const apiKey = "XBGR9rfvBUGOxGERVE0cBc3flVg9auOW";
  const endpoint = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query + " " + city)}.json?key=${apiKey}&limit=${limit}&countrySet=AT&idxSet=POI&minFuzzyLevel=1&maxFuzzyLevel=2`;

  const categories = category ? `&categorySet=${category}` : "";
  const opening = openingHours === "nextSevenDays" ? "&openingHours=nextSevenDays" : "";

  const url = `/search?query=${query}&city=${city}&limit=${limit}&category=${category}&openingHours=${openingHours}`;


  // 3. Fetch auf die API
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        container.innerHTML = "<p>No results found. Try different search terms.</p>";
        return;
      }

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
      console.error("API Error:", err);
      container.innerHTML = "<p>Something went wrong while loading results.</p>";
    });
});
