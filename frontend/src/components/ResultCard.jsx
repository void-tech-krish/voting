import React from 'react';

const ResultCard = ({ candidate, index, totalVotes }) => {
  const percentage = totalVotes === 0 ? 0 : Math.round((candidate.votes / totalVotes) * 100);
  
  return (
    <div className="result-card">
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
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: index === 0 ? '#4CAF50' : '#2196F3' 
          }}
        ></div>
      </div>
      <div className="percentage">{percentage}%</div>
    </div>
  );
};

export default ResultCard;
