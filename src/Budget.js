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
    <div>
      <div className='progress-bar'>Progress Bar</div>
      <div className='percentage'>60%</div>
      <div className='back-button'>
        <Link to="/venue" className="button-tile">&lt;</Link>
      </div>
      <h2>Budget</h2>
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
      </div>
      <div className="next-button">
        <Link to="/voting" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Budget;
