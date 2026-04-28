import { useState, useEffect } from 'react';
import axios from 'axios';
import './Results.css';

const API_URL = 'http://localhost:5000/api';

export default function Results() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_URL}/candidates`);
      // Sort by votes descending
      const sorted = res.data.sort((a, b) => b.votes - a.votes);
      setCandidates(sorted);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load results', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading results...</div>;

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="results-container animate-fade-in">
      <h2>Live Election Results</h2>
      <p className="subtitle">Real-time vote count and standings. Total votes cast: <strong>{totalVotes}</strong></p>

      <div className="results-list">
        {candidates.map((candidate, index) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((candidate.votes / totalVotes) * 100);
          return (
            <div key={candidate._id} className="result-card">
              <div className="result-header">
                <div className="rank">#{index + 1}</div>
                <div className="info">
                  <h3>{candidate.name}</h3>
                  <span className="party">{candidate.party}</span>
                </div>
                <div className="vote-count">
                  <span className="number">{candidate.votes}</span>
                  <span className="label">Votes</span>
                </div>
              </div>
              
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${percentage}%`, backgroundColor: index === 0 ? '#4CAF50' : '#2196F3' }}
                ></div>
              </div>
              <div className="percentage">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
