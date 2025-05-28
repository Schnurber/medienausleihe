import React, { useEffect, useState } from 'react';

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchLoans();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3001/users', {
      headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    setUsers(await res.json());
  };

  const fetchLoans = async () => {
    const res = await fetch('http://localhost:3001/loans/all', {
      headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    setLoans(await res.json());
  };

  const userHasLoan = (userId) => loans.some(loan => loan.userId === userId);

  const handleDelete = async (userId) => {
    if (userHasLoan(userId)) {
      setMessage('Nutzer hat noch ausgeliehene Medien.');
      return;
    }
    const res = await fetch(`http://localhost:3001/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
    });
    const result = await res.json();
    setMessage(result.message);
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`http://localhost:3001/users/${userId}/role`, {
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
          <li key={user._id}>
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
            <button
              onClick={() => handleDelete(user._id)}
              disabled={userHasLoan(user._id)}
              style={{ marginLeft: 8 }}
            >
              Löschen
            </button>
            {userHasLoan(user._id) && <span style={{ color: 'red', marginLeft: 8 }}>Hat Ausleihen</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageUser;
