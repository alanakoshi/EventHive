import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Plan.css';
import './App.css';
import { useEffect } from 'react';

function Plan() {
  const [eventName, setEventName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (eventName.trim() === "") {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000); // Hide after 2s
      } else {
        localStorage.setItem("eventName", eventName);
        setIsSubmitted(true);
        setIsEditing(false);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem("eventName");
    if (stored) {
      setEventName(stored);
      setIsSubmitted(true);
      localStorage.removeItem("eventName"); // remove after using
    }
  }, []);

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
      <div className="color-block">
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
            {showWarning && (
        <div className="alert-popup">
          Please enter an event name before continuing.
        </div>
      )}
      {/* Next button */}
      <div className="next-button-row">
        {isSubmitted ? (
          <Link to="/invite-cohost" className="next-button active">
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Plan;
