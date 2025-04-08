import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Theme.css';
import './App.css';

function Theme() {
  const [themeName, setThemeName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);

  const handleInputChange = (e) => {
    setThemeName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && themeName.trim() !== "") {
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        theme: [...(prevOptions.theme || []), themeName]
      }));
      setThemeName("");
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
      <div className='back-button'>
        <Link to="/date" className="button-tile">&lt;</Link>
      </div>
      <h2>Theme</h2>
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
      </div>
      {/* Next button */}
      <div className="next-button-row">
        <Link to="/venue" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

export default Theme;
