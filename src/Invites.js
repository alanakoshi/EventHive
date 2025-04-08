import React from 'react';
import { Link } from 'react-router-dom';

function Invites() {
  return (
    <div className="container">
      <div className='back-button'>
        <Link to="/home" className="button-tile">&lt;</Link>
      </div>
      <h1 className="text-center">Invites</h1>
      <p className="text-center">You don't have any invites yet</p>
    </div>
  );
}

export default Invites;
