document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded");

  const form = document.querySelector(".search-form");
  if (!form) {
    console.warn("Keine .search-form gefunden – main.js wird hier nicht benötigt.");
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = form.querySelector('input[name="query"]').value.trim();
    const city = form.querySelector('input[name="city"]').value.trim();
    const openingHours = form.querySelector('select[name="openingHours"]').value;
    const category = form.querySelector('select[name="category"]').value;
    const limit = form.querySelector('input[name="limit"]').value;

    const params = new URLSearchParams({ query, city, openingHours, category, limit });

    window.location.href = `results.html?${params.toString()}`;
  });
});