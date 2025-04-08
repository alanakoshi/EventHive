import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CohostContext } from './CohostContext';
import './SplitBudget.css'; // or your preferred CSS file
import './App.css';

function SplitBudget() {
  const { cohosts } = useContext(CohostContext);
  const totalBudget = 100;
  const numberOfCohosts = cohosts.length;
  const splitAmount = numberOfCohosts > 0 
    ? (totalBudget / numberOfCohosts).toFixed(2)
    : "0.00";

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '90%' }} />
        <div className="progress-percentage">90%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/tasks" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Split Budget</h1>
      </div>

      {/* Total amount */}
      <div className="total-amount">Total: ${totalBudget.toFixed(2)}</div>

      {/* List of cohosts */}
      <div className="split-list">
        {numberOfCohosts > 0 ? (
          cohosts.map((name, index) => (
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

      {/* Next button */}
      <div className="next-button-row">
        <Link to="/complete" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default SplitBudget;
