import React from 'react';
import { Link } from 'react-router-dom';

function Events() {
  return (
    <div className="container">
      {/* Back button aligned left */}
      <Link to="/home" className="btn back-btn rounded-circle shadow-sm back-icon">
        <i
          className="bi bi-arrow-left-short"
        ></i>
      </Link>

      <h1 className="text-center">Events</h1>
      <p className="text-center">You have not create any events yet</p>
    </div>
  );
}

export default Events;
