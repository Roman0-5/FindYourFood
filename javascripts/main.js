document.addEventListener("DOMContentLoaded", () => {
    console.log("main.js loaded");
  const form = document.querySelector(".search-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Verhindert das Neuladen der Seite

    // Formulareingaben auslesen
    const query = form.querySelector('input[name="query"]').value.trim();
    const city = form.querySelector('input[name="city"]').value.trim();
    const openingHours = form.querySelector('select[name="openingHours"]').value;
    const category = form.querySelector('select[name="category"]').value;
    const limit = form.querySelector('input[name="limit"]').value;

    // URL-Parameter zusammenbauen
    const params = new URLSearchParams({
      query,
      city,
      openingHours,
      category,
      limit
    });

    // Weiterleitung zur Ergebnisseite mit Suchparametern
    window.location.href = `results.html?${params.toString()}`;
  });
});