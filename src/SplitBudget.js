import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CohostContext } from './CohostContext';
import { EventContext } from './EventContext';
import './SplitBudget.css';
import './App.css';

function SplitBudget() {
  const { cohosts } = useContext(CohostContext);
  const { votes } = useContext(EventContext);
  const [myName, setMyName] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMyName(user.displayName || user.email);
      } else {
        setMyName('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Build the cohost list, always including your name if available.
  const allCohosts = myName
    ? (cohosts.length === 0 ? [myName] : (cohosts.includes(myName) ? cohosts : [myName, ...cohosts]))
    : cohosts;

  // Compute totalBudget based on highest voted budget amount.
  let totalBudget = 0;
  if (votes.budget && Object.keys(votes.budget).length > 0) {
    const highestVotedBudget = Object.keys(votes.budget).reduce((prev, curr) =>
      votes.budget[prev] >= votes.budget[curr] ? prev : curr
    );
    totalBudget = parseFloat(highestVotedBudget.replace(/[^0-9.]/g, '')) || 0;
  }  

  // Calculate split per cohost using the merged list (including yourself)
  const numberOfCohosts = allCohosts.length;
  const splitAmount =
    numberOfCohosts > 0 ? (totalBudget / numberOfCohosts).toFixed(2) : "0.00";

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '90%' }} />
        <div className="progress-percentage">90%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/tasks" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Split Budget</h1>
      </div>

      {/* Total amount display */}
      <div className="total-amount">Total: ${totalBudget.toFixed(2)}</div>

      {/* List of cohosts (including yourself) */}
      <div className="split-list">
        {numberOfCohosts > 0 ? (
          allCohosts.map((name, index) => (
            <div key={index} className="split-item">
              <div className="avatar-circle">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="name">{name}</div>
              <div className="amount">${splitAmount}</div>
            </div>
          ))
        ) : (
          <div>No cohosts added.</div>
        )}
      </div>

      <div className="next-button-row">
        <Link to="/complete" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default SplitBudget;