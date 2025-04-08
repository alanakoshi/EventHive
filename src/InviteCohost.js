import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import './InviteCohost.css';
import './App.css';

function InviteCohost() {
  const { cohosts, setCohosts } = useContext(CohostContext);
  const [cohostName, setCohostName] = useState("");
  const [showWarning, setShowWarning] = useState(false);


  const handleInputChange = (e) => {
    setCohostName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (cohostName.trim() === "") {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000); // auto-hide after 2s
      } else {
        setCohosts([...cohosts, cohostName]);
        setCohostName("");
      }
    }
  };

  const removeCohost = (index) => {
    const updatedCohosts = cohosts.filter((_, i) => i !== index);
    setCohosts(updatedCohosts);
  };

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '20%' }} />
        <div className="progress-percentage">20%</div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/plan" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Invite Cohost</h1>
      </div>
      <div className='color-block'>
        <div className='event-block'>
          <input 
            type="text" 
            placeholder="Enter cohost name" 
            value={cohostName} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyPress}
            className="event-input"
          />
        </div>
      </div>
      <div className='cohost-list'>
        {cohosts.map((name, index) => (
          <div key={index} className="cohost-name-box">
            {name}
            <button 
              className="remove-button" 
              onClick={() => removeCohost(index)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {showWarning && (
        <div className="alert-popup">
          Please enter a cohost name before continuing.
        </div>
      )}
      <div className="next-button-row">
        {cohosts.length > 0 ? (
          <Link to="/date" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled style={{ backgroundColor: '#ccc', color: '#666' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default InviteCohost;
