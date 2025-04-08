import React from 'react';
import { Link } from 'react-router-dom';

function Events() {
  return (
    <div className="container">
      <div className='back-button'>
        <Link to="/home" className="button-tile">&lt;</Link>
      </div>
      <h1 className="text-center">Events</h1>
      <p className="text-center">You have not create any events yet</p>
    </div>
  );
}

export default Events;
