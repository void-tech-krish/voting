import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Vote from './pages/Vote';
import Results from './pages/Results';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('username') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'voter');
  const [hasVoted, setHasVoted] = useState(localStorage.getItem('hasVoted') === 'true');

  const handleLogin = (newToken, username, userRole, userStatus, userHasVoted) => {
    setToken(newToken);
    setUser(username);
    setRole(userRole);
    setHasVoted(userHasVoted);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    localStorage.setItem('role', userRole);
    localStorage.setItem('hasVoted', userHasVoted);
  };

  const handleLogout = () => {
    setToken('');
    setUser('');
    setRole('voter');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  };

  return (
    <Router>
      <div className="app-container">
        {token && <Navbar onLogout={handleLogout} username={user} role={role} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to={role === 'admin' ? "/admin-dashboard" : "/dashboard"} />} />
            <Route path="/admin-login" element={!token ? <AdminLogin onLogin={handleLogin} /> : <Navigate to={role === 'admin' ? "/admin-dashboard" : "/dashboard"} />} />
            <Route path="/dashboard" element={token && role === 'voter' ? <Dashboard username={user} hasVoted={hasVoted} /> : <Navigate to={role === 'admin' ? "/admin-dashboard" : "/login"} />} />
            <Route path="/admin-dashboard" element={token && role === 'admin' ? <AdminDashboard token={token} username={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/vote" element={token && role === 'voter' ? <Vote token={token} hasVoted={hasVoted} /> : <Navigate to={role === 'admin' ? "/admin-dashboard" : "/login"} />} />
            <Route path="/results" element={token ? <Results token={token} role={role} /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={token ? (role === 'admin' ? "/admin-dashboard" : "/dashboard") : "/login"} />} />
          </Routes>
        </main>
        {token && role === 'voter' && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;
