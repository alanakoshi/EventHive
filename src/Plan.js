import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Plan.css';
import './App.css';

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
    <div>
      <div className='progress-bar'>Progress Bar</div>
      <div className='percentage'>10%</div>
      <div className='back-button'>
        <Link to="/" className="button-tile">&lt;</Link>
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
