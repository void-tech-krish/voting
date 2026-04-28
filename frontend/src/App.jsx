import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vote from './pages/Vote';
import Results from './pages/Results';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('username') || '');

  const handleLogin = (newToken, username) => {
    setToken(newToken);
    setUser(username);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setToken('');
    setUser('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <div className="app-container">
        {token && <Navbar onLogout={handleLogout} username={user} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={token ? <Dashboard username={user} /> : <Navigate to="/login" />} />
            <Route path="/vote" element={token ? <Vote token={token} /> : <Navigate to="/login" />} />
            <Route path="/results" element={token ? <Results /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
        {token && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;
