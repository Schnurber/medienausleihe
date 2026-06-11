import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

// Komponente zur Verwaltung der Nutzer (Mehrfach-Löschen per Checkbox, Rollenwechsel)
function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState({});
  const hasSelection = Object.values(selected).some(Boolean);

  // Nutzer und Ausleihen beim Laden abrufen
  useEffect(() => {
    fetchUsers();
    fetchLoans();
  }, []);

  // Nutzer vom Server laden
  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    setUsers(await res.json());
  };

  // Alle Ausleihen laden
  const fetchLoans = async () => {
    const res = await fetch(`${API_BASE_URL}/loans/all`, {
      headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    setLoans(await res.json());
  };

  // Prüfen, ob Nutzer noch Ausleihen hat
  const userHasLoan = (userId) => loans.some(loan => loan.userId === userId);

  // Checkbox-Auswahl für Löschen
  const handleCheckbox = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Mehrere Nutzer löschen
  const handleDelete = async () => {
    const idsToDelete = Object.keys(selected).filter(id => selected[id]);
    if (idsToDelete.length === 0) return;
    let anyBlocked = false;
    for (const id of idsToDelete) {
      if (userHasLoan(id)) {
        anyBlocked = true;
        continue;
      }
      await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
      });
    }
    setMessage(anyBlocked ? 'Einige Nutzer konnten nicht gelöscht werden (haben Ausleihen).' : 'Ausgewählte Nutzer gelöscht.');
    setSelected({});
    fetchUsers();
  };

  // Rolle des Nutzers ändern
  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({ role: newRole })
    });
    const result = await res.json();
    setMessage(result.message);
    fetchUsers();
  };

  return (
    <div>
      <h2>Nutzerverwaltung</h2>
      <div className="message">{message}</div>
      <ul>
        {users.map(user => (
          <li key={user._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span>
              {user.name} ({user.email}) – Rolle: 
              <select
                value={user.role}
                onChange={e => handleRoleChange(user._id, e.target.value)}
                style={{ marginLeft: 8, marginRight: 8 }}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </span>
            <span>
              <label htmlFor={"inp"+ user._id} style={{marginRight: 4}}>Löschen:</label>
              <input
                id={"inp"+ user._id}
                type="checkbox"
                checked={!!selected[user._id]}
                onChange={() => handleCheckbox(user._id)}
                disabled={userHasLoan(user._id)}
                style={{marginRight: 8}}
              />
              {userHasLoan(user._id) && <span style={{ color: 'red', marginLeft: 8 }}>Hat Ausleihen</span>}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleDelete}
        className="danger-button"
        disabled={!hasSelection}
      >
        Ausgewaehlte loeschen
      </button>
    </div>
  );
}

export default ManageUser;
