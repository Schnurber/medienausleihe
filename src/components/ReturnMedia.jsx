import React, { useState, useEffect } from 'react';

// Komponente zum Zurückgeben von Medien (nur eigene Ausleihen)
function ReturnMedia() {
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({ loanId: '' });
  const [message, setMessage] = useState('');

  // Eigene Ausleihen beim Laden abrufen
  useEffect(() => {
    async function fetchLoans() {
      const response = await fetch('http://localhost:3001/loans', {
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
      });
      let allLoans = [];
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        allLoans = await response.json();
      }
      setLoans(Array.isArray(allLoans) ? allLoans : []);
    }
    fetchLoans();
  }, []);

  // Formularfelder aktualisieren
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Medium zurückgeben
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/return', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setMessage(result.message || 'Medium erfolgreich zurückgegeben!');
      // Ausleihenliste aktualisieren
      const loansResponse = await fetch('http://localhost:3001/loans', {
        headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
      });
      const allLoans = await loansResponse.json();
      setLoans(Array.isArray(allLoans) ? allLoans : []);
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
                Medium: {loan.title || 'Unbekannt'}
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
