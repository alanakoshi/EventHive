import { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Theme.css';
import './App.css';
import { updateEventInFirestore, fetchEventByID } from './firebaseHelpers';

function Theme() {
  const [themeName, setThemeName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    const loadSavedThemes = async () => {
      const eventID = localStorage.getItem("eventID");
      const continuePlanning = localStorage.getItem("continuePlanning") === "true";

      if (!eventID) return;

      if (continuePlanning) {
        const event = await fetchEventByID(eventID);
        const loadedThemes = event?.theme || [];
        setEventOptions(prev => ({ ...prev, theme: loadedThemes }));
        localStorage.setItem("theme", JSON.stringify(loadedThemes));
      } else {
        const localThemes = JSON.parse(localStorage.getItem("theme")) || [];
        setEventOptions(prev => ({ ...prev, theme: localThemes }));
      }
    };

    loadSavedThemes();
  }, [setEventOptions]);

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { theme: eventOptions.theme });
  };

  const handleInputChange = (e) => setThemeName(e.target.value);
  const handleEditChange = (e) => setEditingValue(e.target.value);

  const tryAddTheme = () => {
    const trimmed = themeName.trim();
    if (trimmed === "") return;
    const updatedThemes = [...(eventOptions.theme || []), trimmed];
    setEventOptions((prev) => ({ ...prev, theme: updatedThemes }));
    setThemeName("");

    const eventID = localStorage.getItem("eventID");
    updateEventInFirestore(eventID, { theme: updatedThemes });
    localStorage.setItem("theme", JSON.stringify(updatedThemes));
  };

  const trySaveEdit = () => {
    const trimmed = editingValue.trim();
    if (trimmed === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
    } else {
      const updatedThemes = [...eventOptions.theme];
      updatedThemes[editingIndex] = trimmed;
      setEventOptions((prev) => ({ ...prev, theme: updatedThemes }));

      const eventID = localStorage.getItem("eventID");
      updateEventInFirestore(eventID, { theme: updatedThemes });
      localStorage.setItem("theme", JSON.stringify(updatedThemes));

      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') tryAddTheme();
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(eventOptions.theme[index]);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const removeTheme = (index) => {
    const updatedThemes = eventOptions.theme.filter((_, i) => i !== index);
    setEventOptions((prev) => ({ ...prev, theme: updatedThemes }));

    const eventID = localStorage.getItem("eventID");
    updateEventInFirestore(eventID, { theme: updatedThemes });
    localStorage.setItem("theme", JSON.stringify(updatedThemes));
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '40%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">40%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/date" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Theme</h1>
      </div>

      <div className='color-block'>
        <div className='event-block'>
          <input
            type="text"
            placeholder="Enter a theme"
            value={themeName}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && tryAddTheme()}
            onBlur={tryAddTheme}
            className="event-input"
            ref={inputRef}
          />
        </div>
      </div>

      <div className='cohost-list'>
        {eventOptions.theme?.map((name, index) => (
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
                <button className="edit-button" onClick={() => handleEditClick(index)}>Edit</button>
                <button className="remove-button" onClick={() => removeTheme(index)}>✕</button>
              </>
            )}
          </div>
        ))}
      </div>

      {showWarning && <div className="alert-popup">Please enter a theme before continuing.</div>}

      <div className="next-button-row">
        {eventOptions.theme?.length > 0 ? (
          <Link to="/venue" onClick={handleNext} className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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

export default Theme;
