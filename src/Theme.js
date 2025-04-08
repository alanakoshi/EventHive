import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Theme.css';
import './App.css';

function Theme() {
  const [themeName, setThemeName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);


  const handleInputChange = (e) => {
    setThemeName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (themeName.trim() === "") {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      } else {
        setEventOptions((prevOptions) => ({
          ...prevOptions,
          theme: [...(prevOptions.theme || []), themeName]
        }));
        setThemeName("");
      }
    }
  };

  const removeTheme = (index) => {
    setEventOptions((prevOptions) => ({
      ...prevOptions,
      theme: prevOptions.theme.filter((_, i) => i !== index)
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
        {/* Back button aligned left */}
        <Link to="/date" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i
            className="bi bi-arrow-left-short"
          ></i>
        </Link>

        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Theme</h1>
      </div>
      <div className='color-block'>
        <div className='event-block'>
          <input
            type="text"
            placeholder="Enter a theme"
            value={themeName}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="event-input"
          />
        </div>
      </div>
      <div className='cohost-list'>
          {eventOptions.theme?.map((name, index) => (
            <div key={index} className="cohost-name-box">
              {name}
              <button
                className="remove-button"
                onClick={() => removeTheme(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {showWarning && (
        <div className="alert-popup">
          Please enter a theme before continuing.
        </div>
      )}
      {/* Next button */}
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
