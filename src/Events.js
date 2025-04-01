import React from 'react';
import { Link } from 'react-router-dom';

function Events() {
  return (
    <div>
      <div className='back-button'>
        <Link to="/" className="button-tile">&lt;</Link>
      </div>
      <h2>Event Page</h2>
      <p>This is the Event page content.</p>
    </div>
  );
}

export default Events;
