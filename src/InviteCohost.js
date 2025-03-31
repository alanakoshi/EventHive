import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Plan.css';
import './App.css';

function InviteCohost() {
  const [cohostName, setCohostName] = useState("");
  const [cohosts, setCohosts] = useState([]);

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
    <div>
      <div className='progress-bar'>Progress Bar</div>
      <div className='percentage'>20%</div>
      <div className='back-button'>
        <Link to="/invite-cohost" className="button-tile">&lt;</Link>
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
      <div className="next-button">
        <Link to="/date" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default InviteCohost;
