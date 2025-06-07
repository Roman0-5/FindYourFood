// /js/main.js

function showUserMenu() {
  document.getElementById('accountDropdownContent').style.display = 'none';
  document.getElementById('userInfo').style.display = '';
  document.getElementById('userDropdownContent').style.display = '';
}

function showGuestMenu() {
  document.getElementById('accountDropdownContent').style.display = '';
  document.getElementById('userInfo').style.display = 'none';
  document.getElementById('userDropdownContent').style.display = 'none';
}

// Beim Laden prüfen, ob User eingeloggt ist
document.addEventListener("DOMContentLoaded", function() {
  const token = localStorage.getItem("token"); // oder "accessToken"
  if (token) {
    showUserMenu();
  } else {
    showGuestMenu();
  }

  // Logout-Button Event
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token'); // oder "accessToken"
      showGuestMenu();
      window.location.href = "/StartSite.html";
    });
  }
});

// (Suche bleibt wie gehabt, hier ggf. dein Such-Code)
const searchForm = document.getElementById('search-form');
if (searchForm) {
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = document.getElementById('query').value.trim();
    const city = document.getElementById('city').value.trim();

    if (query && city) {
      window.location.href = `Results.html?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
    } else {
      alert("Bitte Suchbegriff und Stadt eingeben!");
    }
  });
}
