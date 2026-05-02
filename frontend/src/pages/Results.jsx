import { useState, useEffect } from 'react';
import axios from 'axios';
import './Results.css';
import ResultCard from '../components/ResultCard';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://127.0.0.1:5001/api');

export default function Results({ token, role }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_URL}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.sort((a, b) => b.votes - a.votes);
      setCandidates(sorted);
      setErrorMsg('');
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrorMsg('Results will be available after voting ends.');
      } else {
        console.error('Failed to load results', err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading results...</div>;

  if (errorMsg) return (
    <div className="results-container animate-fade-in">
      <h2>Election Results</h2>
      <div className="error-message" style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '2rem', borderRadius: '8px', textAlign: 'center', marginTop: '2rem' }}>
        <h3>{errorMsg}</h3>
      </div>
    </div>
  );

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="results-container animate-fade-in">
      <h2>{role === 'admin' ? 'Live Election Results (Admin)' : 'Final Election Results'}</h2>
      <p className="subtitle">Real-time vote count and standings. Total votes cast: <strong>{totalVotes}</strong></p>

      <div className="results-list">
        {candidates.map((candidate, index) => (
          <ResultCard 
            key={candidate._id} 
            candidate={candidate} 
            index={index} 
            totalVotes={totalVotes} 
          />
        ))}
      </div>
    </div>
  );
}
