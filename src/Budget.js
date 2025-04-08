import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Budget.css';
import './App.css';

function Budget() {
  const [budgetName, setBudgetName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);

  const handleInputChange = (e) => {
    setBudgetName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && budgetName.trim() !== "") {
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        budget: [...(prevOptions.budget || []), budgetName]
      }));
      setBudgetName("");
    }
  };

  const removeBudget = (index) => {
    setEventOptions((prevOptions) => ({
      ...prevOptions,
      budget: prevOptions.budget.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '60%' }} />
        <div className="progress-percentage">60%</div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/venue" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Budget</h1>
      </div>
      <div className='color-block'>
        <div className='event-block'>
          <input 
            type="text" 
            placeholder="Enter a budget" 
            value={budgetName} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyPress}
            className="event-input"
          />
        </div>
      </div>
      <div className='cohost-list'>
          {eventOptions.budget?.map((name, index) => (
            <div key={index} className="cohost-name-box">
              {name}
              <button 
                className="remove-button" 
                onClick={() => removeBudget(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      {/* Next button */}
      <div className="next-button-row">
        <Link to="/voting" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default Budget;
