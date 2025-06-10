import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Hilfsfunktion: User-ID aus JWT-Token extrahieren
function getUserIdFromToken() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  try {
    // JWT besteht aus 3 Teilen, Payload ist der zweite (Base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
}

// Komponente zum Ausleihen von Medien für eingeloggte Nutzer
function LoanMedia() {
  const [media, setMedia] = useState([]);
  const [formData, setFormData] = useState({ mediaId: '' });
  const [message, setMessage] = useState('');
  const userId = getUserIdFromToken();

  // Medien beim Laden abrufen
  useEffect(() => {
    async function fetchData() {
      const token = sessionStorage.getItem('token');
      const mediaResponse = await fetch(`${API_BASE_URL}/media`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      let contentType = mediaResponse.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        setMedia(await mediaResponse.json());
      }
    }
    fetchData();
  }, []);

  // Formularfelder aktualisieren
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Medium ausleihen
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/loan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        },
        body: JSON.stringify({ userId, mediaId: formData.mediaId }),
      });
      const result = await response.json();
      setMessage(result.message);

      // Medienliste aktualisieren
      const mediaResponse = await fetch(`${API_BASE_URL}/media`, {
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
      });
      setMedia(await mediaResponse.json());
    } catch (error) {
      setMessage('Fehler beim Ausleihen.');
    }
  };

  return (
    <div>
      <h2>Medien ausleihen</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Medium:
          <select name="mediaId" value={formData.mediaId} onChange={handleChange} required>
            <option value="">Bitte wählen...</option>
            {media.filter((item) => item.available).map((item) => (
              <option key={item._id} value={item._id}>{item.title}</option>
            ))}
          </select>
        </label>
        <button type="submit">Ausleihen</button>
        <div className="message">{message}</div>
      </form>
    </div>
  );
}

export default LoanMedia;
