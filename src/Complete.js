import React from 'react';
import './Complete.css';
import { useNavigate } from 'react-router-dom';

function Complete() {
  const navigate = useNavigate();

  return (
    <div className="complete-container">
      <div className="complete-card">
        <div className="top-row">
          <button className="back-button" onClick={() => navigate(-1)}>&larr;</button>
          <h2>Complete</h2>
          <div className="progress-bar">
            <div className="bar" />
            <span>100%</span>
          </div>
        </div>
        <div className="details">
          <p><strong>Date:</strong> March 22</p>
          <p><strong>Theme:</strong> Disney</p>
          <p><strong>Venue:</strong> Pool</p>
          <p><strong>Budget:</strong> $33.34</p>
          <p><strong>Tasks:</strong> Finished</p>
        </div>
        <button className="home-button" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  );
}

export default Complete;
