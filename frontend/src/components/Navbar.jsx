import { Link, useLocation } from 'react-router-dom';
import { LogOut, Vote, BarChart2, Home } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onLogout, username, role }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Vote className="nav-icon" />
        <span>AI Voting Assistant</span>
      </div>
      
      <div className="nav-links">
        {role === 'admin' ? (
          <>
            <Link to="/admin-dashboard" className={`nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
              <Home size={18} /> Admin Panel
            </Link>
            <Link to="/results" className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}>
              <BarChart2 size={18} /> Live Results
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/vote" className={`nav-link ${location.pathname === '/vote' ? 'active' : ''}`}>
              <Vote size={18} /> Cast Vote
            </Link>
            <Link to="/results" className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}>
              <BarChart2 size={18} /> Results
            </Link>
          </>
        )}
      </div>

      <div className="nav-user">
        <span className="welcome-text">Hi, {username}</span>
        <button onClick={onLogout} className="btn-logout">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
