import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Plan.css';
import './App.css';
import './components/ProgressBar';

function Plan() {
  const [eventName, setEventName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && eventName.trim() !== "") {
      setIsSubmitted(true);
      setIsEditing(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '10%' }} />
        <div className="progress-percentage">10%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/home" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Event Name</h1>
      </div>
      <div className="color-block d-flex justify-content-center">
        <div className='event-block'>
          {isSubmitted ? (
            <div className="event-name-box">
              {eventName}
              <button onClick={handleEditClick} className="edit-button">Edit</button>
            </div>
          ) : (
            <input 
              type="text" 
              placeholder="Enter event name" 
              value={eventName} 
              onChange={handleInputChange} 
              onKeyDown={handleKeyPress}
              className="event-input"
            />
          )}
        </div>
      </div>
      {/* Next button */}
      <div className="next-button-row">
        <Link to="/invite-cohost" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default Plan;
