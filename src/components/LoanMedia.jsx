import React, { useState, useEffect } from 'react';

function LoanMedia() {
  const [users, setUsers] = useState([]);
  const [media, setMedia] = useState([]);
  const [formData, setFormData] = useState({ userId: '', mediaId: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      const usersResponse = await fetch('http://localhost:3001/users');
      const mediaResponse = await fetch('http://localhost:3001/media');
      setUsers(await usersResponse.json());
      setMedia(await mediaResponse.json());
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setMessage(result.message);
      // Refresh media list
      const mediaResponse = await fetch('http://localhost:3001/media');
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
          Benutzer:
          <select name="userId" value={formData.userId} onChange={handleChange} required>
            <option value="">Bitte wählen...</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </label>
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
