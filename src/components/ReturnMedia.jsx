import React, { useState, useEffect } from 'react';

function ReturnMedia() {
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({ loanId: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchLoans() {
      const response = await fetch('http://localhost:3001/loans');
      setLoans(await response.json());
    }
    fetchLoans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setMessage(result.message || 'Medium erfolgreich zurückgegeben!');
      // Refresh loans list
      const loansResponse = await fetch('http://localhost:3001/loans');
      setLoans(await loansResponse.json());
    } catch (error) {
      setMessage('Fehler beim Zurückgeben.');
    }
  };

  return (
    <div>
      <h2>Medium zurückgeben</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Ausgeliehen:
          <select name="loanId" value={formData.loanId} onChange={handleChange} required>
            <option value="">Bitte wählen...</option>
            {loans.map((loan) => (
              <option key={loan._id} value={loan._id}>
                Benutzer: {loan.userName || 'Unbekannt'}, Medium: {loan.mediaTitle || 'Unbekannt'}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Zurückgeben</button>
        <div className="message">{message}</div>
      </form>
    </div>
  );
}

export default ReturnMedia;
