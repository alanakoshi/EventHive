// Venue.js
import { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Venue.css';
import './App.css';
import { updateEventInFirestore, fetchEventByID } from './firebaseHelpers';

function Venue() {
  const [venueName, setVenueName] = useState('');
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    const loadVenues = async () => {
      const eventID = localStorage.getItem('eventID');
      const continuePlanning = localStorage.getItem('continuePlanning') === 'true';

      if (!eventID) return;

      if (continuePlanning) {
        const event = await fetchEventByID(eventID);
        const loadedVenues = event?.venue || [];
        setEventOptions(prev => ({ ...prev, venue: loadedVenues }));
      } else {
        // New event → Clear venues
        setEventOptions(prev => ({ ...prev, venue: [] }));
      }
    };

    loadVenues();
  }, [setEventOptions]);

  const handleInputChange = (e) => setVenueName(e.target.value);
  const handleEditChange = (e) => setEditingValue(e.target.value);

  const tryAddVenue = () => {
    const trimmed = venueName.trim();
    if (trimmed === '') return;
    const updatedVenues = [...(eventOptions.venue || []), trimmed];
    setEventOptions((prev) => ({ ...prev, venue: updatedVenues }));
    setVenueName('');
    const eventID = localStorage.getItem('eventID');
    updateEventInFirestore(eventID, { venue: updatedVenues });
  };

  const trySaveEdit = () => {
    const trimmed = editingValue.trim();
    if (trimmed === '') {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
    } else {
      const updatedVenues = [...eventOptions.venue];
      updatedVenues[editingIndex] = trimmed;
      setEventOptions((prev) => ({ ...prev, venue: updatedVenues }));
      const eventID = localStorage.getItem('eventID');
      updateEventInFirestore(eventID, { venue: updatedVenues });
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(eventOptions.venue[index]);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const removeVenue = (index) => {
    const updatedVenues = eventOptions.venue.filter((_, i) => i !== index);
    setEventOptions((prev) => ({ ...prev, venue: updatedVenues }));
    const eventID = localStorage.getItem('eventID');
    updateEventInFirestore(eventID, { venue: updatedVenues });
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem('eventID');
    await updateEventInFirestore(eventID, { venue: eventOptions.venue });
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '50%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">50%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/theme" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Venue</h1>
      </div>

      <div className="color-block">
        <div className="event-block">
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
        </div>
      </div>

      <div className="cohost-list">
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

      {showWarning && <div className="alert-popup">Please enter a venue before continuing.</div>}

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
