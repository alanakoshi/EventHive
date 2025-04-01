import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Venue.css';
import './App.css';

function Venue() {
  const [venueName, setVenueName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);

  const handleInputChange = (e) => {
    setVenueName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && venueName.trim() !== "") {
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        venue: [...(prevOptions.venue || []), venueName]
      }));
      setVenueName("");
    }
  };

  const removeVenue = (index) => {
    setEventOptions((prevOptions) => ({
      ...prevOptions,
      venue: prevOptions.venue.filter((_, i) => i !== index)
    }));
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
            value={venueName} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyPress}
            className="event-input"
          />
        </div>
        <div className='cohost-list'>
          {eventOptions.venue?.map((name, index) => (
            <div key={index} className="cohost-name-box">
              {name}
              <button 
                className="remove-button" 
                onClick={() => removeVenue(index)}
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
