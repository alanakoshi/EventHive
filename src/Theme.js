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
    <div>
      <div className='progress-bar'>Progress Bar</div>
      <div className='percentage'>40%</div>
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
      <div className="next-button">
        <Link to="/venue" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Theme;
