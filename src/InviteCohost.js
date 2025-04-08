import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import './InviteCohost.css';
import './App.css';
import './components/ProgressBar';

function InviteCohost() {
  const { cohosts, setCohosts } = useContext(CohostContext);
  const [cohostName, setCohostName] = useState("");

  const handleInputChange = (e) => {
    setCohostName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && cohostName.trim() !== "") {
      setCohosts([...cohosts, cohostName]);
      setCohostName("");
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
      <div className='back-button'>
        <Link to="/plan" className="button-tile">&lt;</Link>
      </div>
      <h2>Invite Cohost</h2>
      <h3>Add Cohost</h3>
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
      </div>
      {/* Next button */}
      <div className="next-button-row">
        <Link to="/date" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default InviteCohost;
