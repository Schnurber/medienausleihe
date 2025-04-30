import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import AddMedia from './components/AddMedia'; 
import AddUser from './components/AddUser'; 
import LoanMedia from './components/LoanMedia';
import ReturnMedia from './components/ReturnMedia'; 
function App() {
  return (
    <div className="App">
      <header>
        <h1>Medienausleihe</h1>
      </header>
        <nav>
          <ul>
            <li><Link to="/add-media">Medium hinzufügen</Link></li>
            <li><Link to="/add-user">Benutzer hinzufügen</Link></li>
            <li><Link to="/loan-media">Medien ausleihen</Link></li>
            <li><Link to="/return-media">Medium zurückgeben</Link></li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/add-media" element={<AddMedia />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/loan-media" element={<LoanMedia />} />
            <Route path="/return-media" element={<ReturnMedia />} />
          </Routes>
        </main>
    </div>
  );
}

export default App;
