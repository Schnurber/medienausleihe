import './App.css';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import ManageMedia from './components/ManageMedia'; 
import LoanMedia from './components/LoanMedia';
import ReturnMedia from './components/ReturnMedia'; 
import Auth from './components/Auth';
import ManageUser from './components/ManageUser';

function getUserRoleFromToken() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

function getUserNameFromToken() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || null;
  } catch {
    return null;
  }
}

function App() {
  const isLoggedIn = !!sessionStorage.getItem('token');
  const userRole = getUserRoleFromToken();
  const userName = getUserNameFromToken();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    window.location.href = `${process.env.PUBLIC_URL}/auth`;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Medienausleihe</h1>
            <p className="subtitle">Leihen, verwalten und zurueckgeben in einer klaren Uebersicht.</p>
          </div>
          {isLoggedIn && userName && (
            <div className="user-box">
              <span>Angemeldet als {userName}</span>
              <span className="role-badge">Rolle: {userRole}</span>
              <button type="button" className="ghost-button" onClick={handleLogout}>Abmelden</button>
            </div>
          )}
        </div>
      </header>

      <nav className="main-nav">
        <ul className="nav-list">
          {isLoggedIn ? (
            <>
              {userRole === 'admin' && <li><NavLink to="/add-media" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Medien verwalten</NavLink></li>}
              {userRole === 'admin' && <li><NavLink to="/manage-user" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Nutzer verwalten</NavLink></li>}
              <li><NavLink to="/loan-media" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Medien ausleihen</NavLink></li>
              <li><NavLink to="/return-media" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Medium zurueckgeben</NavLink></li>
            </>
          ) : (
            <li><NavLink to="/auth" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Login und Registrierung</NavLink></li>
          )}
        </ul>
      </nav>

      <main className="content-area">
        <Routes>
          {isLoggedIn && userRole === 'admin' && <Route path="/add-media" element={<ManageMedia />} />}
          {isLoggedIn && userRole === 'admin' && <Route path="/manage-user" element={<ManageUser />} />}
          {isLoggedIn && <Route path="/loan-media" element={<LoanMedia />} />}
          {isLoggedIn && <Route path="/return-media" element={<ReturnMedia />} />}
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to={isLoggedIn ? '/loan-media' : '/auth'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
