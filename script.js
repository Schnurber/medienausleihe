// loanmedia.html: Dropdowns für Benutzer und Medien
async function loadDropdowns() {
  try {
    const [usersResponse, mediaResponse] = await Promise.all([
      fetch('http://localhost:3000/users'),
      fetch('http://localhost:3000/media')
    ]);

    const users = await usersResponse.json();
    const media = await mediaResponse.json();

    const userSelect = document.getElementById('userId'); // loanmedia.html
    const mediaSelect = document.getElementById('mediaId'); // loanmedia.html
    userSelect.innerHTML = ''; // Vorherige Optionen entfernen
    mediaSelect.innerHTML = ''; // Vorherige Optionen entfernen
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user._id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });

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
    const response = await fetch('http://localhost:3000/loans');
    const loans = await response.json();

    const loanSelect = document.getElementById('loanId'); // returnmedia.html
    loanSelect.innerHTML = ''; // Vorherige Optionen entfernen
    loans.forEach(loan => {
      if (!loan.returnedAt) {
        const option = document.createElement('option');
        option.value = loan._id;
        option.textContent = `Benutzer: ${loan.userName || 'Unbekannt'}, Medium: ${loan.mediaTitle || 'Unbekannt'}`;
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

  const userId = document.getElementById('userId').value;
  const mediaId = document.getElementById('mediaId').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3000/loan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mediaId })
    });
    const result = await response.json();
    loadDropdowns()
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
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const result = await response.json();
    messageDiv.textContent = result.message || 'Benutzer erfolgreich hinzugefügt!';
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
    const response = await fetch('http://localhost:3000/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch('http://localhost:3000/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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