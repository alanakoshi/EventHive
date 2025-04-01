import React from 'react';
import { Link } from 'react-router-dom';

function Money() {
  return (
    <div>
      <div className='back-button'>
        <Link to="/" className="button-tile">&lt;</Link>
      </div>
      <h2>Money Page</h2>
      <p>This is the Money page content.</p>
    </div>
  );
}

export default Money;
