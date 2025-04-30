import React, { useState } from 'react';

function AddMedia() {
  const [formData, setFormData] = useState({ title: '', mediaType: '', available: true });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Fehler beim Hinzufügen des Mediums.');
    }
  };

  return (
    <div>
      <h2>Medium hinzufügen</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Titel:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Typ:
          <input type="text" name="mediaType" value={formData.mediaType} onChange={handleChange} required />
        </label>
        <label>
          Verfügbar:
          <select name="available" value={formData.available} onChange={handleChange}>
            <option value={true}>Ja</option>
            <option value={false}>Nein</option>
          </select>
        </label>
        <button type="submit">Medium hinzufügen</button>
        <div className="message">{message}</div>
      </form>
    </div>
  );
}

export default AddMedia;
