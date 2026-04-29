import { Link } from 'react-router-dom';
import { Vote, BarChart2, MessageSquare } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ username, hasVoted }) {
  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <h1>Welcome to the Voting Portal, {username}!</h1>
        <p>Your voice matters. Participate in the democratic process securely and easily.</p>
        <div style={{ marginTop: '1rem', padding: '0.5rem 1rem', display: 'inline-block', borderRadius: '4px', backgroundColor: hasVoted ? '#dcfce7' : '#fef9c3', color: hasVoted ? '#166534' : '#854d0e', fontWeight: 'bold' }}>
          Status: {hasVoted ? 'Voted' : 'Not Voted'}
        </div>
      </header>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon blue"><Vote size={32} /></div>
          <h3>Cast Your Vote</h3>
          <p>Review candidate profiles and securely submit your vote. Remember, you can only vote once.</p>
          <Link to="/vote" className="btn-primary">Go to Voting Page</Link>
        </div>

        <div className="card">
          <div className="card-icon green"><BarChart2 size={32} /></div>
          <h3>View Results</h3>
          <p>Check the real-time standings and election results. See how your candidate is performing.</p>
          <Link to="/results" className="btn-secondary">Live Results</Link>
        </div>

        <div className="card">
          <div className="card-icon purple"><MessageSquare size={32} /></div>
          <h3>AI Assistant</h3>
          <p>Not sure who to vote for? Use the AI Chatbot in the bottom right corner to ask questions about the election!</p>
        </div>
      </div>
    </div>
  );
}
