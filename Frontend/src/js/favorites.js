document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("favorites-container");
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!favorites.length) {
        container.innerHTML = "<p>Du hast noch keine Favoriten.</p>";
        return;
    }
    favorites.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("result-card");
        card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.phone || "Keine Telefonnummer"}</p>
      <p>${item.address}</p>
      <p><strong>Category:</strong> ${item.category}</p>
      <span class="favorite-star active"
            data-name="${item.name}"
            data-address="${item.address}"
      >★</span>
    `;
        container.appendChild(card);

        const star = card.querySelector(".favorite-star");
        // Klick zum Entfernen aus Favoriten
        star.addEventListener("click", () => {
            let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
            favs = favs.filter(f => !(f.name === item.name && f.address === item.address));
            localStorage.setItem("favorites", JSON.stringify(favs));
            card.remove();
            if (!favs.length) {
                container.innerHTML = "<p>Du hast noch keine Favoriten.</p>";
            }
        });
    });
});
