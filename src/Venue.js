import { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Venue.css';
import './App.css';
import { updateEventInFirestore } from './firebaseHelpers';

function Venue() {
  const [venueName, setVenueName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
  const editRef = useRef(null);

  const handleInputChange = (e) => {
    setVenueName(e.target.value);
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { theme: eventOptions.theme });
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (venueName.trim() === "") {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      } else {
        setEventOptions((prevOptions) => ({
          ...prevOptions,
          venue: [...(prevOptions.venue || []), venueName]
        }));
        setVenueName("");
      }
    }
  };

  const removeVenue = (index) => {
    const updatedVenues = eventOptions.venue.filter((_, i) => i !== index);
    setEventOptions((prev) => ({
      ...prev,
      venue: updatedVenues,
    }));
  };

  const tryAddVenue = () => {
    if (venueName.trim() === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }
    setEventOptions((prevOptions) => ({
      ...prevOptions,
      venue: [...(prevOptions.venue || []), venueName]
    }));
    setVenueName("");
  };
  
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(eventOptions.venue[index]);
  };
  
  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
  };
  
  const trySaveEdit = () => {
    if (editingValue.trim() === "") return;
    const updatedVenues = [...eventOptions.venue];
    updatedVenues[editingIndex] = editingValue;
    setEventOptions((prev) => ({
      ...prev,
      venue: updatedVenues,
    }));
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '50%' }} />
        <div className="progress-percentage">50%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/theme" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Venue</h1>
      </div>

      <div className='color-block'>
        <div className='event-block'>
          <input
            type="text"
            placeholder="Enter a venue"
            value={venueName}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && tryAddVenue()}
            onBlur={tryAddVenue}
            className="event-input"
            ref={inputRef}
          />
          {showWarning && (
            <div className="alert-popup">
              Please enter a venue before continuing.
            </div>
          )}
        </div>
      </div>

      <div className='cohost-list'>
        {eventOptions.venue?.map((name, index) => (
          <div key={index} className="cohost-name-box">
            {editingIndex === index ? (
              <input
                type="text"
                value={editingValue}
                onChange={handleEditChange}
                onKeyDown={(e) => e.key === 'Enter' && trySaveEdit()}
                onBlur={trySaveEdit}
                className="event-input"
                ref={editRef}
              />
            ) : (
              <>
                {name}
                <button className="edit-button" onClick={() => handleEditClick(index)}>
                  Edit
                </button>
                <button className="remove-button" onClick={() => removeVenue(index)}>
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="next-button-row">
        {eventOptions.venue?.length > 0 ? (
          <Link to="/voting" onClick={handleNext} className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled style={{ backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Venue;
