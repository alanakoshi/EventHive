import React, { useContext } from 'react';
import './Complete.css';
import { useNavigate } from 'react-router-dom';
import { EventContext } from './EventContext';

function Complete() {
  const navigate = useNavigate();
  const { eventOptions } = useContext(EventContext);

  const theme = eventOptions.theme[0] || 'N/A';
  const venue = eventOptions.venue[0] || 'N/A';
  const budget = eventOptions.budget[0] || '0.00';
  const date = eventOptions.dates[0] || 'N/A';

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
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Theme:</strong> {theme}</p>
          <p><strong>Venue:</strong> {venue}</p>
          <p><strong>Budget:</strong> ${budget}</p>
          <p><strong>Tasks:</strong> Finished</p>
        </div>
        <button className="home-button" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  );
}

export default Complete;
