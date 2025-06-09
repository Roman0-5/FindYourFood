document.addEventListener("DOMContentLoaded", () => {
    const form    = document.getElementById("account-settings-form");
    const message = document.getElementById("settings-message");
    const token   = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 1) Profildaten laden
    fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            form.username.value = data.user.username;
            form.email.value    = data.user.email;
        })
        .catch(() => {
            message.style.color = 'var(--color-accent)';
            message.textContent = '❌ Fehler beim Laden der Profildaten';
        });

    // 2) Update absenden
    form.addEventListener("submit", async e => {
        e.preventDefault();
        message.textContent = '';

        const payload = {
            username: form.username.value.trim(),
            email:    form.email.value.trim()
        };

        try {
            const res = await fetch(`/api/users/${data.user.id}`, {
                method:  'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body:    JSON.stringify(payload)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            message.style.color   = 'green';
            message.textContent   = '✅ Einstellungen gespeichert';
        } catch (err) {
            message.style.color   = 'var(--color-accent)';
            message.textContent   = `❌ ${err.message}`;
        }
    });
});
