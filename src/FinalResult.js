import { useContext } from 'react';
import { EventContext } from './EventContext';
import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function FinalResult() {
  const { eventOptions, votes } = useContext(EventContext);

  // Get ranked options or fallback to eventOptions
  const getRankedOptions = (category) => {
    const categoryVotes = votes[category];

    if (categoryVotes && Object.keys(categoryVotes).length > 0) {
      return Object.entries(categoryVotes)
        .sort((a, b) => b[1] - a[1])
        .map(([option, score]) => ({ option, score }));
    }

    //Fallback: return original options with default scores
    return eventOptions[category]?.map((option, index) => ({
      option,
      score: eventOptions[category].length - index, // reverse order = implied top-down
    })) || [];
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '80%' }} />
        <div className="progress-percentage">80%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/voting" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Final Rankings</h1>
      </div>

      {/* Display rankings */}
      {Object.keys(eventOptions).map((category) => {
        const ranked = getRankedOptions(category);
        return (
          <div key={category} className="category-section">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}:</h3>
            <ol className="ranked-list">
              {ranked.map(({ option, score }, index) => (
                <li key={option} className={index === 0 ? 'top-pick' : ''}>
                  {option} <span className="score-tag">({score} pts)</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      <div className="next-button-row">
        <Link to="/tasks" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default FinalResult;
