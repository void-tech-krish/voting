import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Vote.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

export default function Vote({ token, hasVoted }) {
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState('not_started');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, statusRes] = await Promise.all([
          axios.get(`${API_URL}/candidates`),
          axios.get(`${API_URL}/election-status`)
        ]);
        setCandidates(candidatesRes.data);
        setElectionStatus(statusRes.data.status);
        setLoading(false);
      } catch (err) {
        setError('Failed to load election data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }
    setError('');
    
    try {
      await axios.post(
        `${API_URL}/vote`,
        { candidateId: selectedCandidate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Your vote has been cast successfully!');
      // Update hasVoted locally for immediate feedback if needed
      localStorage.setItem('hasVoted', 'true');
      setTimeout(() => {
        window.location.href = '/dashboard'; // Force reload to update App state
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  if (loading) return <div className="loading">Loading candidates...</div>;

  if (hasVoted) {
    return (
      <div className="vote-container animate-fade-in">
        <h2>You have already voted</h2>
        <p className="subtitle">Thank you for participating! You can only vote once.</p>
        <button className="btn-primary" onClick={() => navigate('/results')}>View Results</button>
      </div>
    );
  }

  if (electionStatus === 'not_started') {
    return (
      <div className="vote-container animate-fade-in">
        <h2>Voting has not started yet</h2>
        <p className="subtitle">Please check back later once the admin starts the election.</p>
      </div>
    );
  }

  if (electionStatus === 'ended') {
    return (
      <div className="vote-container animate-fade-in">
        <h2>The election has ended</h2>
        <p className="subtitle">Voting is now closed. You can view the final results.</p>
        <button className="btn-primary" onClick={() => navigate('/results')}>View Results</button>
      </div>
    );
  }

  return (
    <div className="vote-container animate-fade-in">
      <h2>Cast Your Vote</h2>
      <p className="subtitle">Please review the candidates below and make your selection.</p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="candidates-list">
        {candidates.map((candidate) => (
          <div 
            key={candidate._id} 
            className={`candidate-card ${selectedCandidate === candidate._id ? 'selected' : ''}`}
            onClick={() => setSelectedCandidate(candidate._id)}
          >
            <div className="candidate-header">
              <h3>{candidate.name}</h3>
              <span className="party-badge">{candidate.party}</span>
            </div>
            <p className="candidate-desc">{candidate.description}</p>
            <div className="radio-btn">
              <div className={`radio-inner ${selectedCandidate === candidate._id ? 'active' : ''}`}></div>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="btn-primary vote-btn" 
        onClick={handleVote}
        disabled={!selectedCandidate || success}
      >
        Submit Vote
      </button>
    </div>
  );
}
