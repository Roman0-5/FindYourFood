// frontend/src/js/profile.js
document.addEventListener('DOMContentLoaded', () => {
    // Nav wird von main.js befüllt
    const info = document.getElementById('profile-info');
    const token = localStorage.getItem('token');

    if (!token) {
        // nicht eingeloggt → Login-Seite
        window.location.href = 'login.html';
        return;
    }

    // Helper für API-Aufrufe mit JWT
    const api = (path, opts={}) => fetch(path, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...opts.headers
        }
    });

    // 1) Profildaten laden
    api('/api/users/me')
        .then(res => {
            if (!res.ok) throw new Error('Fehler beim Laden');
            return res.json();
        })
        .then(data => {
            const u = data.user;
            info.innerHTML = `
        <p><strong>Username:</strong> ${u.username}</p>
        <p><strong>E-Mail:</strong> ${u.email}</p>
        <p><strong>ID:</strong> ${u.id}</p>
      `;
        })
        .catch(err => {
            info.innerHTML = `<p style="color:var(--color-accent)">❌ ${err.message}</p>`;
        });
});
