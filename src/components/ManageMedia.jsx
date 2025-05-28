import React, { useState, useEffect } from 'react';

function ManageMedia() {
  const [formData, setFormData] = useState({ title: '', mediaType: '', available: true });
  const [message, setMessage] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('http://localhost:3001/media', {
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
      });
      const data = await response.json();
      setMediaList(Array.isArray(data) ? data : []);
    } catch {
      setMediaList([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckbox = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/media', {
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

  const handleDelete = async () => {
    const idsToDelete = Object.keys(selected).filter(id => selected[id]);
    if (idsToDelete.length === 0) return;
    try {
      for (const id of idsToDelete) {
        await fetch(`http://localhost:3001/media/${id}`, {
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
          <input name="available" value={formData.available} hidden />

     
        <button type="submit">Medium hinzufügen</button>
        <div className="message">{message}</div>
      </form>

      <h2>Vorhandene Medien</h2>
      <form class="medialist" onSubmit={e => { e.preventDefault(); handleDelete(); }}>
        <ul>
          {mediaList.map(m => (
            <li key={m._id}>
                <span>{m.title} ({m.mediaType}) {m.available ? '✅' : '❌'}</span>
                {m.available && (
                  <>
                    <label htmlFor={"inp"+ m._id}> 
                      Löschen: 
                    </label>
                    <input
                      id={"inp"+ m._id}
                      type="checkbox"
                      checked={!!selected[m._id]}
                      onChange={() => handleCheckbox(m._id)}
                    />
                  </>
                )}
            </li>
          ))}
        </ul>
        <button type="submit">Ausgewählte löschen</button>
      </form>
    </div>
  );
}

export default ManageMedia;
