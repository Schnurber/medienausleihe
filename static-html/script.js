// login.html: Login-Formular
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3002/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (response.ok) {
      localStorage.setItem('token', result.token);
      messageDiv.textContent = 'Login erfolgreich! Weiterleitung...';
      messageDiv.style.color = 'green';
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      messageDiv.textContent = result.message || 'Login fehlgeschlagen.';
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    messageDiv.textContent = 'Fehler beim Login.';
    messageDiv.style.color = 'red';
  }
});

// Hilfsfunktion: Auth-Header aus localStorage
function authHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

function getCurrentUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch {
    return null;
  }
}

// loanmedia.html: Dropdowns für Benutzer und Medien
async function loadDropdowns() {
  try {
    const currentUser = getCurrentUserFromToken();
    const isAdmin = currentUser?.role === 'admin';

    const [mediaResponse, usersResponse] = await Promise.all([
      fetch('http://localhost:3002/media', { headers: authHeaders() }),
      isAdmin ? fetch('http://localhost:3002/users', { headers: authHeaders() }) : Promise.resolve(null)
    ]);

    const media = await mediaResponse.json();
    const users = usersResponse ? await usersResponse.json() : [];

    const userSelect = document.getElementById('userId'); // loanmedia.html
    const mediaSelect = document.getElementById('mediaId'); // loanmedia.html

    userSelect.innerHTML = '<option value="">Bitte wählen...</option>';
    mediaSelect.innerHTML = '<option value="">Bitte wählen...</option>';

    if (isAdmin && !Array.isArray(users)) {
      console.error('Benutzer konnten nicht geladen werden:', users.message);
      return;
    }
    if (!Array.isArray(media)) {
      console.error('Medien konnten nicht geladen werden:', media.message);
      return;
    }

    if (isAdmin) {
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user._id;
        option.textContent = user.name;
        userSelect.appendChild(option);
      });
      userSelect.disabled = false;
    } else {
      const option = document.createElement('option');
      option.value = currentUser?.userId || '';
      option.textContent = currentUser?.name || 'Eigener Benutzer';
      userSelect.appendChild(option);
      userSelect.value = option.value;
      userSelect.disabled = true;
    }

    media.forEach(item => {
      if (item.available) {
        const option = document.createElement('option');
        option.value = item._id;
        option.textContent = item.title;
        mediaSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Fehler beim Laden der Dropdown-Daten:', error);
  }
}

// returnmedia.html: Dropdown für aktive Ausleihen
async function loadLoansDropdown() {
  try {
    const currentUser = getCurrentUserFromToken();
    const isAdmin = currentUser?.role === 'admin';
    const endpoint = isAdmin ? 'http://localhost:3002/loans/all' : 'http://localhost:3002/loans';
    const response = await fetch(endpoint, { headers: authHeaders() });
    const loans = await response.json();
    if (!Array.isArray(loans)) {
      console.error('Ausleihen konnten nicht geladen werden:', loans.message);
      return;
    }

    const loanSelect = document.getElementById('loanId'); // returnmedia.html
    loanSelect.innerHTML = '<option value="">Bitte wählen...</option>';
    loans.forEach(loan => {
      if (!loan.returnedAt) {
        const option = document.createElement('option');
        option.value = loan._id;
        if (isAdmin) {
          option.textContent = `Benutzer: ${loan.userName || 'Unbekannt'}, Medium: ${loan.title || 'Unbekannt'}`;
        } else {
          option.textContent = `Medium: ${loan.title || 'Unbekannt'}`;
        }
        loanSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Fehler beim Laden der Ausleihen:', error);
  }
}

// loanmedia.html: Formular für das Ausleihen eines Mediums
document.getElementById('loanForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentUser = getCurrentUserFromToken();
  const isAdmin = currentUser?.role === 'admin';
  const userId = isAdmin ? document.getElementById('userId').value : currentUser?.userId;
  const mediaId = document.getElementById('mediaId').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3002/loan', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ userId, mediaId })
    });
    const result = await response.json();
    loadDropdowns();
    messageDiv.textContent = result.message;
    messageDiv.style.color = response.ok ? 'green' : 'red';
  } catch (error) {
    messageDiv.textContent = 'Fehler beim Senden der Anfrage.';
    messageDiv.style.color = 'red';
  }
});

// adduser.html: Formular für das Hinzufügen eines Benutzers
document.getElementById('addUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3002/users', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();
    messageDiv.textContent = result.message;
    messageDiv.style.color = response.ok ? 'green' : 'red';
  } catch (error) {
    messageDiv.textContent = 'Fehler beim Hinzufügen des Benutzers.';
    messageDiv.style.color = 'red';
  }
});

// addmedia.html: Formular für das Hinzufügen eines Mediums
document.getElementById('addMediaForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const mediaType = document.getElementById('mediaType').value;
  const available = document.getElementById('available').value === 'true';
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3002/media', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, mediaType, available })
    });

    const result = await response.json();
    messageDiv.textContent = result.message || 'Medium erfolgreich hinzugefügt!';
    messageDiv.style.color = response.ok ? 'green' : 'red';
  } catch (error) {
    messageDiv.textContent = 'Fehler beim Hinzufügen des Mediums.';
    messageDiv.style.color = 'red';
  }
});

// returnmedia.html: Formular für das Zurückgeben eines Mediums
document.getElementById('returnForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const loanId = document.getElementById('loanId').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3002/return', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ loanId })
    });
    loadLoansDropdown();
    const result = await response.json();
    messageDiv.textContent = result.message || 'Medium erfolgreich zurückgegeben!';
    messageDiv.style.color = response.ok ? 'green' : 'red';
  } catch (error) {
    messageDiv.textContent = 'Fehler beim Zurückgeben des Mediums.';
    messageDiv.style.color = 'red';
  }
});