import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Budget.css';
import './App.css';

function Budget() {
  const [budgetName, setBudgetName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);


  const handleInputChange = (e) => {
    const rawValue = e.target.value;
  
    // Allow only numbers and one optional dot
    const sanitized = rawValue.replace(/[^0-9.]/g, '');
  
    // Prevent multiple dots
    const dotCount = (sanitized.match(/\./g) || []).length;
    if (dotCount > 1) return;
  
    setBudgetName(sanitized);
  };
  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const value = parseFloat(budgetName);
  
      if (isNaN(value)) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
        return;
      }
  
      const formatted = `$${value.toFixed(2)}`;
  
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        budget: [...(prevOptions.budget || []), formatted],
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
        {showWarning && (
          <div className="alert-popup">
            Please enter a budget item before continuing.
          </div>
        )}
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
        {eventOptions.budget?.length > 0 ? (
          <Link to="/voting" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled style={{ backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Budget;
