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
      <div className="back-button">
        <Link to="/home" className="btn btn-light rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left"></i>
        </Link>
      </div>
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '10%' }} />
        <div className="progress-percentage">10%</div>
      </div>

      <h2>Plan</h2>
      <h3>Event Name</h3>
      <div className='color-block'>
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
      <div className="next-button">
        <Link to="/invite-cohost" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Plan;
