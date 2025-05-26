import React, { useState } from 'react';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const url = isRegister ? 'http://localhost:3001/register' : 'http://localhost:3001/login';
    const payload = isRegister ? formData : { email: formData.email, password: formData.password };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      setMessage(result.message);
      if (response.ok && !isRegister) {
        // Token speichern
        if (result.token) {
          sessionStorage.setItem('token', result.token);
        }
      }
    } catch {
      setMessage('Fehler bei der Anfrage.');
    }
  };

  return (
    <div>
      <h2>{isRegister ? 'Registrieren' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Name:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
        )}
        <label>
          E-Mail:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label>
          Passwort:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <button type="submit">{isRegister ? 'Registrieren' : 'Login'}</button>
        <div className="message">{message}</div>
      <button onClick={() => setIsRegister(!isRegister)} style={{marginTop: '1rem'}}>
        {isRegister ? 'Zum Login' : 'Neu registrieren'}
      </button>
      </form>
    </div>
  );
}

export default Auth;
