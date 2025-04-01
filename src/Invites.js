import React from 'react';
import { Link } from 'react-router-dom';

function Invites() {
  return (
    <div>
      <div className='back-button'>
        <Link to="/" className="button-tile">&lt;</Link>
      </div>
      <h2>Invites Page</h2>
      <p>This is the Invites page content.</p>
    </div>
  );
}

export default Invites;
