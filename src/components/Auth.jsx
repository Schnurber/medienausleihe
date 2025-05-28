import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Komponente für Login und Registrierung
function Auth() {
  // State für Formular, Rückmeldung, Modus (Login/Registrierung)
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Formularfelder aktualisieren
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Login oder Registrierung absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const url = isRegister ? 'http://localhost:3001/register' : 'http://localhost:3001/login';
    const payload = isRegister ? formData : { email: formData.email, password: formData.password };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Fehlerbehandlung für Netzwerkfehler und leere Antwort
      let result = {};
      try {
        result = await response.json();
      } catch {
        setMessage('Server antwortet nicht oder liefert ungültige Daten.');
        return;
      }
      setMessage(result.message);
      if (response.ok && !isRegister) {
        // Token speichern und weiterleiten
        if (result.token) {
          sessionStorage.setItem('token', result.token);
          window.location.href = '/loan-media'; // Seite neu laden, damit Menü und Routing stimmen
        }
      }
      // Registrierung erfolgreich: Wechsel auf Login-Ansicht
      if (response.ok && isRegister) {
        setIsRegister(false);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      setMessage('Fehler bei der Anfrage: ' + (err?.message || ''));
    }
  };

  return (
    <div>
      <h2>{isRegister ? 'Registrieren' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: isRegister ? 'block' : 'none' }}>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required={isRegister}
            autoComplete="off"
          />
        </label>
        <label>
          E-Mail:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label>
          Passwort:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <button type="submit">{isRegister ? 'Registrieren' : 'Login'}</button>
        <div className="message">{message}</div>
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          style={{ marginTop: '1rem' }}
        >
          {isRegister ? 'Zum Login' : 'Neu registrieren'}
        </button>
      </form>
    </div>
  );
}

export default Auth;
