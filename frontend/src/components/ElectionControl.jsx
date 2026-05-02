import React from 'react';

const ElectionControl = ({ electionStatus, handleUpdateElectionStatus }) => {
  return (
    <div>
      <h3>Election Control</h3>
      <div className="election-status-card">
        <p>Current Status: <strong>{electionStatus.replace('_', ' ').toUpperCase()}</strong></p>
        <div className="status-actions">
          <button 
            className="btn-primary" 
            onClick={() => handleUpdateElectionStatus('not_started')} 
            disabled={electionStatus === 'not_started'}
          >
            Reset to Not Started
          </button>
          <button 
            className="btn-success" 
            onClick={() => handleUpdateElectionStatus('active')} 
            disabled={electionStatus === 'active'}
          >
            Start Election
          </button>
          <button 
            className="btn-danger" 
            onClick={() => handleUpdateElectionStatus('ended')} 
            disabled={electionStatus === 'ended'}
          >
            End Election
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElectionControl;
