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
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '50%' }} />
        <div className="progress-percentage">50%</div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/theme" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Venue</h1>
      </div>
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
      {/* Next button */}
      <div className="next-button-row">
        <Link to="/budget" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default Venue;
