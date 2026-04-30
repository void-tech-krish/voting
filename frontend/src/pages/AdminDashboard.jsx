import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

export default function AdminDashboard({ token, username }) {
  const [activeTab, setActiveTab] = useState('voters');
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState('not_started');
  const [analytics, setAnalytics] = useState({ totalVoters: 0, votersVoted: 0, participationRate: 0 });
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'voters') {
        const res = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(res.data);
      } else if (activeTab === 'candidates') {
        const res = await axios.get(`${API_URL}/candidates`);
        setCandidates(res.data);
      } else if (activeTab === 'election' || activeTab === 'analytics') {
        const [statusRes, analyticsRes] = await Promise.all([
          axios.get(`${API_URL}/election-status`),
          axios.get(`${API_URL}/admin/analytics`, { headers })
        ]);
        setElectionStatus(statusRes.data.status);
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/status`, { status }, { headers });
      fetchData();
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
      fetchData();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/candidates`, newCandidate, { headers });
      setNewCandidate({ name: '', party: '', description: '' });
      fetchData();
    } catch (err) {
      alert('Error adding candidate');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await axios.delete(`${API_URL}/admin/candidates/${id}`, { headers });
      fetchData();
    } catch (err) {
      alert('Error deleting candidate');
    }
  };

  const handleUpdateElectionStatus = async (status) => {
    try {
      await axios.put(`${API_URL}/admin/election-status`, { status }, { headers });
      fetchData();
    } catch (err) {
      alert('Error updating election status');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <button className={activeTab === 'voters' ? 'active' : ''} onClick={() => setActiveTab('voters')}>Voter Management</button>
        <button className={activeTab === 'candidates' ? 'active' : ''} onClick={() => setActiveTab('candidates')}>Candidate Management</button>
        <button className={activeTab === 'election' ? 'active' : ''} onClick={() => setActiveTab('election')}>Election Control</button>
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
      </div>
      
      <div className="admin-content">
        {activeTab === 'voters' && (
          <div>
            <h3>Registered Voters</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Has Voted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>{u.hasVoted ? 'Yes' : 'No'}</td>
                    <td>{u.status}</td>
                    <td>
                      {u.status !== 'blocked' && <button className="btn-warning" onClick={() => handleUpdateUserStatus(u._id, 'blocked')}>Block</button>}
                      {u.status === 'blocked' && <button className="btn-success" onClick={() => handleUpdateUserStatus(u._id, 'approved')}>Approve</button>}
                      <button className="btn-danger" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div>
            <h3>Manage Candidates</h3>
            <form onSubmit={handleAddCandidate} className="admin-form">
              <input type="text" placeholder="Name" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
              <input type="text" placeholder="Party" value={newCandidate.party} onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} required />
              <textarea placeholder="Description" value={newCandidate.description} onChange={e => setNewCandidate({...newCandidate, description: e.target.value})} required />
              <button type="submit" className="btn-primary">Add Candidate</button>
            </form>
            <table className="admin-table mt-4">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Party</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.party}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDeleteCandidate(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'election' && (
          <div>
            <h3>Election Control</h3>
            <div className="election-status-card">
              <p>Current Status: <strong>{electionStatus.replace('_', ' ').toUpperCase()}</strong></p>
              <div className="status-actions">
                <button className="btn-primary" onClick={() => handleUpdateElectionStatus('not_started')} disabled={electionStatus === 'not_started'}>Reset to Not Started</button>
                <button className="btn-success" onClick={() => handleUpdateElectionStatus('active')} disabled={electionStatus === 'active'}>Start Election</button>
                <button className="btn-danger" onClick={() => handleUpdateElectionStatus('ended')} disabled={electionStatus === 'ended'}>End Election</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h3>Analytics & Results Overview</h3>
            <div className="analytics-cards">
              <div className="card">
                <h4>Total Voters</h4>
                <p>{analytics.totalVoters}</p>
              </div>
              <div className="card">
                <h4>Voters Participated</h4>
                <p>{analytics.votersVoted}</p>
              </div>
              <div className="card">
                <h4>Participation Rate</h4>
                <p>{analytics.participationRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
