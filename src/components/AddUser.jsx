import React, { useState } from 'react';

function AddUser() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Fehler beim Hinzufügen des Benutzers.');
    }
  };

  return (
    <div>
      <h2>Neuen Benutzer hinzufügen</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          E-Mail:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <button type="submit">Benutzer hinzufügen</button>
        <div className="message">{message}</div>
      </form>
    </div>
  );
}

export default AddUser;
