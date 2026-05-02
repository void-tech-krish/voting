import React from 'react';

const CandidateCard = ({ candidate, isSelected, onSelect }) => {
  return (
    <div 
      className={`candidate-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(candidate._id)}
    >
      <div className="candidate-header">
        <h3>{candidate.name}</h3>
        <span className="party-badge">{candidate.party}</span>
      </div>
      <p className="candidate-desc">{candidate.description}</p>
      <div className="radio-btn">
        <div className={`radio-inner ${isSelected ? 'active' : ''}`}></div>
      </div>
    </div>
  );
};

export default CandidateCard;
