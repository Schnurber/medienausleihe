import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Komponente zur Verwaltung von Medien (Hinzufügen und Löschen)
function ManageMedia() {
  // State für Formular, Rückmeldungen, Medienliste und Auswahl
  const [formData, setFormData] = useState({ title: '', mediaType: '', available: true });
  const [message, setMessage] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [selected, setSelected] = useState({});

  // Medien beim Laden der Komponente abrufen
  useEffect(() => {
    fetchMedia();
  }, []);

  // Medien vom Server laden
  const fetchMedia = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/media`, {
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
      });
      const data = await response.json();
      setMediaList(Array.isArray(data) ? data : []);
    } catch {
      setMediaList([]);
    }
  };

  // Formularfelder aktualisieren
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Checkbox-Auswahl für Löschen
  const handleCheckbox = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Medium hinzufügen
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setMessage(result.message);
      fetchMedia();
    } catch (error) {
      setMessage('Fehler beim Hinzufügen des Mediums.');
    }
  };

  // Ausgewählte Medien löschen
  const handleDelete = async () => {
    const idsToDelete = Object.keys(selected).filter(id => selected[id]);
    if (idsToDelete.length === 0) return;
    try {
      for (const id of idsToDelete) {
        await fetch(`${API_BASE_URL}/media/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
        });
      }
      setMessage('Ausgewählte Medien gelöscht.');
      setSelected({});
      fetchMedia();
    } catch {
      setMessage('Fehler beim Löschen.');
    }
  };

  return (
    <div>
      <h2>Medienverwaltung</h2>
      <div className="message">{message}</div>
      <form onSubmit={handleSubmit} style={{marginBottom: '2rem'}}>
        <label>
          Titel:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Typ:
          <input type="text" name="mediaType" value={formData.mediaType} onChange={handleChange} required />
        </label>
        <input name="available" value={formData.available} hidden />
        <button type="submit">Medium hinzufügen</button>
      </form>

      <ul>
        {mediaList.map(m => (
          <li key={m._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span>
              {m.title} ({m.mediaType}) – {m.available ? <span style={{color: 'green'}}>verfügbar</span> : <span style={{color: 'red'}}>ausgeliehen</span>}
            </span>
            {m.available && (
              <span>
                <label htmlFor={"inp"+ m._id} style={{marginRight: 4}}>Löschen:</label>
                <input
                  id={"inp"+ m._id}
                  type="checkbox"
                  checked={!!selected[m._id]}
                  onChange={() => handleCheckbox(m._id)}
                  style={{marginRight: 8}}
                />
              </span>
            )}
          </li>
        ))}
      </ul>
      <button onClick={handleDelete} style={{marginTop: '1rem'}}>Ausgewählte löschen</button>
    </div>
  );
}

export default ManageMedia;
