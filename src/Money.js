import React from 'react';
import { Link } from 'react-router-dom';

function Money() {
  return (
    <div className="container">
      {/* Back button aligned left */}
      <Link to="/home" className="btn back-btn rounded-circle shadow-sm back-icon">
        <i
          className="bi bi-arrow-left-short"
        ></i>
      </Link>
      <h1 className="text-center mb-4">Money</h1>
      <h2 className="text-center">You Owe</h2>
      <p className="text-center">You don't owe anyone yet</p>
      <h2 className="text-center">Owes You</h2>
      <p className="text-center">No one owes you yet</p>
    </div>
  );
}

export default Money;
