import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import VoterManagement from '../components/VoterManagement';
import CandidateManagement from '../components/CandidateManagement';
import ElectionControl from '../components/ElectionControl';
import AnalyticsOverview from '../components/AnalyticsOverview';

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
          <VoterManagement 
            users={users} 
            handleUpdateUserStatus={handleUpdateUserStatus} 
            handleDeleteUser={handleDeleteUser} 
          />
        )}

        {activeTab === 'candidates' && (
          <CandidateManagement 
            candidates={candidates} 
            newCandidate={newCandidate} 
            setNewCandidate={setNewCandidate} 
            handleAddCandidate={handleAddCandidate} 
            handleDeleteCandidate={handleDeleteCandidate} 
          />
        )}

        {activeTab === 'election' && (
          <ElectionControl 
            electionStatus={electionStatus} 
            handleUpdateElectionStatus={handleUpdateElectionStatus} 
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsOverview analytics={analytics} />
        )}
      </div>
    </div>
  );
}
