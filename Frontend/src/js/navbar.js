document.addEventListener("DOMContentLoaded", () => {
  fetch("../partials/navbar.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("navbarContainer").innerHTML = html;

      // Reinitialisiere Dropdown-Logik
      if (typeof initializeAccountDropdown === "function") {
        initializeAccountDropdown();
      }
      if (typeof checkSessionForNavigation === "function") {
        checkSessionForNavigation();
      }
    })
    .catch((err) => {
      console.error("Fehler beim Laden der Navigation:", err);
    });
});