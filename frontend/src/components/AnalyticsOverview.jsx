import React from 'react';

const AnalyticsOverview = ({ analytics }) => {
  return (
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
  );
};

export default AnalyticsOverview;
