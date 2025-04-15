import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addEventToFirestore, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';
import './Plan.css';
import './App.css';

function Plan() {
  const [eventName, setEventName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      const eventID = localStorage.getItem("eventID");
      if (eventID) {
        const event = await fetchEventByID(eventID);
        if (event?.name) {
          setEventName(event.name);
          setIsSubmitted(true);
        }
      }
    };
    loadEvent();
  }, []);

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter') {
      if (eventName.trim() === "") {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      } else {
        const eventID = await addEventToFirestore(auth.currentUser.uid, eventName, "", "");
        localStorage.setItem("eventID", eventID);
        setIsSubmitted(true);
        setIsEditing(false);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    if (!eventID && eventName.trim() !== "") {
      const newEventID = await addEventToFirestore(auth.currentUser.uid, eventName, "", "");
      localStorage.setItem("eventID", newEventID);
    }
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '10%' }} />
        <div className="progress-percentage">10%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/home" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
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

      <div className="next-button-row">
        {isSubmitted ? (
          <Link to="/invite-cohost" onClick={handleNext} className="next-button active">
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
