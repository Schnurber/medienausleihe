import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import AddMedia from './components/AddMedia'; 
import AddUser from './components/AddUser'; 
import LoanMedia from './components/LoanMedia';
import ReturnMedia from './components/ReturnMedia'; 
import Auth from './components/Auth';

function App() {
  const isLoggedIn = !!sessionStorage.getItem('token');
  // console.log(isLoggedIn);
  return (
    <div className="App">
      <header>
        <h1>Medienausleihe</h1>
      </header>
      <nav>
        <ul>
          {isLoggedIn ? (
            <>
              <li><Link to="/add-media">Medium hinzufügen</Link></li>
              <li><Link to="/add-user">Benutzer hinzufügen</Link></li>
              <li><Link to="/loan-media">Medien ausleihen</Link></li>
              <li><Link to="/return-media">Medium zurückgeben</Link></li>
            </>
          ) : (
            <li><Link to="/auth">Login/Registrierung</Link></li>
          )}
        </ul>
      </nav>
      <main>
        <Routes>
          {isLoggedIn && <Route path="/add-media" element={<AddMedia />} />}
          {isLoggedIn && <Route path="/add-user" element={<AddUser />} />}
          {isLoggedIn && <Route path="/loan-media" element={<LoanMedia />} />}
          {isLoggedIn && <Route path="/return-media" element={<ReturnMedia />} />}
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
