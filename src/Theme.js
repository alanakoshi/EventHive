import { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Theme.css';
import './App.css';

function Theme() {
  const [themeName, setThemeName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
  const editRef = useRef(null);

  const handleInputChange = (e) => setThemeName(e.target.value);
  const handleEditChange = (e) => setEditingValue(e.target.value);

  const tryAddTheme = () => {
    const trimmed = themeName.trim();
    if (trimmed === "") return;
    setEventOptions((prevOptions) => ({
      ...prevOptions,
      theme: [...(prevOptions.theme || []), trimmed],
    }));
    setThemeName("");
    setShowWarning(false);
  };

  const trySaveEdit = () => {
    const trimmed = editingValue.trim();
    if (trimmed === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
    } else {
      const updatedThemes = [...eventOptions.theme];
      updatedThemes[editingIndex] = trimmed;
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        theme: updatedThemes,
      }));
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
    setTimeout(() => {
      editRef.current?.focus();
    }, 0);
  };

  const removeTheme = (index) => {
    const updatedThemes = eventOptions.theme.filter((_, i) => i !== index);
    setEventOptions((prevOptions) => ({
      ...prevOptions,
      theme: updatedThemes,
    }));
  };

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '40%' }} />
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
                <button className="edit-button" onClick={() => handleEditClick(index)}>
                  Edit
                </button>
                <button className="remove-button" onClick={() => removeTheme(index)}>
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showWarning && (
        <div className="alert-popup">
          Please enter a theme before continuing.
        </div>
      )}

      <div className="next-button-row">
        {eventOptions.theme?.length > 0 ? (
          <Link to="/venue" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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
