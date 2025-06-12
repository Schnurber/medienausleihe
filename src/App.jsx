import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
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
  // console.log(isLoggedIn);
  return (
    <div className="App">
      <header>
        <h1>Medienausleihe</h1>
        <p>
          {isLoggedIn && userName && (
            <span style={{fontWeight: 'bold', color: '#fff'}}>Angemeldet als: {userName} Rolle: {userRole}</span>
          )}
        </p>
      </header>
      <nav>
        <ul>
          {isLoggedIn ? (
            <>
              {userRole === 'admin' && <li><Link Link to={`${process.env.PUBLIC_URL}/add-media`}>Medien verwalten</Link></li>}
              {userRole === 'admin' && <li><Link Link to={`${process.env.PUBLIC_URL}/manage-user`}>Nutzer verwalten</Link></li>}
              <li><Link Link to={`${process.env.PUBLIC_URL}/loan-media`}>Medien ausleihen</Link></li>
              <li><Link Link to={`${process.env.PUBLIC_URL}/return-media`}>Medium zurückgeben</Link></li>
            </>
          ) : (
            <li><Link to={`${process.env.PUBLIC_URL}/auth`}>Login/Registrierung</Link></li>
          )}
        </ul>
      </nav>
      <main>
        <Routes>
          {isLoggedIn && userRole === 'admin' && <Route path={`${process.env.PUBLIC_URL}/add-media`} element={<ManageMedia />} />}
          {isLoggedIn && userRole === 'admin' && <Route path={`${process.env.PUBLIC_URL}/manage-user`} element={<ManageUser />} />}
          {isLoggedIn && <Route path={`${process.env.PUBLIC_URL}/loan-media`} element={<LoanMedia />} />}
          {isLoggedIn && <Route path={`${process.env.PUBLIC_URL}/return-media`} element={<ReturnMedia />} />}
          <Route path={`${process.env.PUBLIC_URL}/auth`} element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
