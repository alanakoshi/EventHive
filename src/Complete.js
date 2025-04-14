import React, { useContext } from 'react';
import './Complete.css';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';

function Complete() {
  const { eventOptions } = useContext(EventContext);

  const theme = eventOptions.theme[0] || 'N/A';
  const venue = eventOptions.venue[0] || 'N/A';
  const date = eventOptions.dates[0] || 'N/A';

  return (
    <div className="complete-container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '100%' }} />
        <div className="progress-percentage">100%</div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/tasks" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Complete</h1>
      </div>
      <div className="details">
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Theme:</strong> {theme}</p>
          <p><strong>Venue:</strong> {venue}</p>
          <p><strong>Tasks:</strong> Finished</p>
        </div>
        <div className="next-button-row">
          <Link to="/home" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Home
          </Link>
      </div>
    </div>
  );
}

export default Complete;
