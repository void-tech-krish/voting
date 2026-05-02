import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://127.0.0.1:5001/api');

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { username, password, expectedRole: 'voter' } : { username, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (isLogin) {
        onLogin(res.data.token, res.data.username, res.data.role, res.data.status, res.data.hasVoted);
        navigate('/dashboard');
      } else {
        setIsLogin(true);
        setUsername('');
        setPassword('');
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="subtitle">AI Voting Assistant Portal</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <a href="/admin-login" style={{ color: '#64748b', textDecoration: 'none' }}>Go to Admin Portal</a>
        </div>
      </div>
    </div>
  );
}
