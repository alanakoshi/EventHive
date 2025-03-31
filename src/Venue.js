import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Venue.css';
import './App.css';

function Venue() {
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
        <div className='percentage'>50%</div>
        <div className='back-button'>
            <Link to="/theme" className="button-tile">&lt;</Link>
        </div>
        <h2>Venue</h2>
        <div className='color-block'>
          <div className='event-block'>
            <input 
              type="text" 
              placeholder="Enter a venue" 
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
        <Link to="/budget" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Venue;
