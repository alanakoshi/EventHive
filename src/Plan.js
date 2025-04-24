// Plan.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addEventToFirestore, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';
import { CohostContext } from './CohostContext';
import { EventContext } from './EventContext';
import './Plan.css';
import './App.css';

function Plan() {
  const { setCohosts } = useContext(CohostContext);
  const { setEventOptions } = useContext(EventContext);

  const [eventName, setEventName]     = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHost, setIsHost]           = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate                      = useNavigate();

  // On mount, load any existing event
  useEffect(() => {
    const loadEvent = async () => {
      const eventID = localStorage.getItem("eventID");
      if (eventID) {
        const event = await fetchEventByID(eventID);
        if (event?.name) {
          setEventName(event.name);
          setIsSubmitted(true);
        }
        if (event?.hostID === auth.currentUser?.uid) {
          setIsHost(true);
        }
      } else {
        // No event yet → current user is host
        setIsHost(true);
      }
    };
    loadEvent();
  }, []);

  // Wipe previous event data from context + localStorage
  const clearOldData = () => {
    setCohosts([]);
    setEventOptions(prev => ({
      ...prev,
      dates: {},
      theme: [],
      // add other option fields here if needed
    }));
    localStorage.removeItem("cohosts");
    localStorage.removeItem("dates");
    localStorage.removeItem("theme");
  };

  // Create a fresh event, store ID, clear old data
  const createNewEvent = async () => {
    if (!eventName.trim()) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }
    const eventID = await addEventToFirestore(
      auth.currentUser.uid,
      eventName,
      "", // description or other fields if you have them
      ""
    );
    localStorage.setItem("eventID", eventID);

    clearOldData();
    setIsSubmitted(true);
    setIsHost(true);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      createNewEvent();
    }
  };

  const handleBlur = () => {
    if (!isSubmitted) {
      createNewEvent();
    }
  };

  // Ensure an event exists before moving on
  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    if (!eventID && eventName.trim()) {
      await createNewEvent();
    }
    navigate("/invite-cohost");
  };

  return (
    <div className="container">
      {/* Progress Bar */}
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '10%' }} />
        </div>
        <div className="progress-percentage">10%</div>
      </div>

      {/* Header + Back */}
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/home" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Event Name
        </h1>
      </div>

      {/* Instructions */}
      <div className="instructions">
        {isHost
          ? "Enter event name."
          : "Event name was set by the host."}
      </div>

      {/* Input or Display */}
      <div className="color-block">
        <div className="event-block">
          {isSubmitted ? (
            <div className="event-name-box">
              {eventName}
              {isHost && (
                <button
                  className="edit-button"
                  onClick={() => setIsSubmitted(false)}
                >
                  Edit
                </button>
              )}
            </div>
          ) : (
            isHost && (
              <input
                type="text"
                placeholder="Enter event name"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleBlur}
                autoFocus
                className="event-input"
              />
            )
          )}
        </div>
      </div>

      {/* Warning */}
      {showWarning && (
        <div className="alert-popup">
          Please enter an event name before continuing.
        </div>
      )}

      {/* Next Button */}
      <div className="next-button-row">
        {isSubmitted ? (
          <button
            className="next-button active"
            onClick={handleNext}
          >
            Next
          </button>
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
