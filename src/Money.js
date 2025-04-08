import React from 'react';
import { Link } from 'react-router-dom';

function Money() {
  return (
    <div className="container">
      <div className='back-button'>
        <Link to="/home" className="button-tile">&lt;</Link>
      </div>
      <h1 className="text-center mb-4">Money</h1>
      <h2 className="text-center">You Owe</h2>
      <p className="text-center">You don't owe anyone yet</p>
      <h2 className="text-center">Owes You</h2>
      <p className="text-center">No one owes you yet</p>
    </div>
  );
}

export default Money;
