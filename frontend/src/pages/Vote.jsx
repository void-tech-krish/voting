import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Vote.css';

const API_URL = 'http://localhost:5000/api';

export default function Vote({ token }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(`${API_URL}/candidates`);
        setCandidates(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load candidates');
        setLoading(false);
      }
    };
    fetchCandidates();
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
      setTimeout(() => navigate('/results'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  if (loading) return <div className="loading">Loading candidates...</div>;

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
