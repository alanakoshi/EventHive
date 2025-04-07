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
    <div className="split-budget-container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '90%' }} />
        <div className="progress-percentage">90%</div>
      </div>

      {/* Header */}
      <div className="header-row">
        <Link to="/tasks" className="back-button">&lt;</Link>
        <h2 className="split-budget-title">Split Budget</h2>
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
