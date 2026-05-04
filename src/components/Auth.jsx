import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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
    const url = isRegister ? `${API_BASE_URL}/register` : `${API_BASE_URL}/login`;
    const payload = isRegister ? formData : { email: formData.email, password: formData.password };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = response.headers.get('content-type') || '';
      let result = {};

      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        setMessage(
          text
            ? `Unerwartete Serverantwort (${response.status}): ${text.slice(0, 160)}`
            : `Serverantwort ohne JSON (${response.status}).`
        );
        return;
      }

      setMessage(result.message || 'Anfrage abgeschlossen.');
      if (response.ok && !isRegister) {
        // Token speichern und weiterleiten
        if (result.token) {
          sessionStorage.setItem('token', result.token);
          window.location.href = `${process.env.PUBLIC_URL}/loan-media`; // Seite neu laden, damit Menü und Routing stimmen
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
