// Theme.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Theme.css';
import './App.css';
import { updateEventInFirestore, fetchEventByID } from './firebaseHelpers';

const THEME_CATEGORIES = ['Kawaii','Disney','Disco'];
const THEME_SUGGESTIONS = {
  Kawaii: ['Cinnamoroll','Smiski','Pom Pom Purin'],
  Disney: ['Mickey','Frozen','Moana'],
  Disco:  ['Studio 54','Mirror Ball','70s Funk']
};

function Theme() {
  const [themeName, setThemeName] = useState("");
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const [showWarning, setShowWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [activeCategory, setActiveCategory] = useState(THEME_CATEGORIES[0]);
  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    const eventID = localStorage.getItem("eventID");
    if (!eventID) return;

    const loadSavedThemes = async () => {
      const event = await fetchEventByID(eventID);
      const fetchedThemes = event?.theme || [];
      setEventOptions(prev =>
        JSON.stringify(prev.theme) !== JSON.stringify(fetchedThemes)
          ? { ...prev, theme: fetchedThemes }
          : prev
      );
    };

    loadSavedThemes();
    const iv = setInterval(loadSavedThemes, 1000);
    return () => clearInterval(iv);
  }, [setEventOptions]);

  const tryAddTheme = (value) => {
    const toAdd = typeof value === 'string' ? value : themeName;
    const trimmed = toAdd.trim();
    if (!trimmed) return;

    const updated = [...(eventOptions.theme || []), trimmed];
    setEventOptions(prev => ({ ...prev, theme: updated }));
    setThemeName("");
    const eventID = localStorage.getItem("eventID");
    updateEventInFirestore(eventID, { theme: updated });
    localStorage.setItem("theme", JSON.stringify(updated));
  };

  const trySaveEdit = () => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setShowWarning(true);
      return void setTimeout(() => setShowWarning(false), 2000);
    }
    const updated = [...eventOptions.theme];
    updated[editingIndex] = trimmed;
    setEventOptions(prev => ({ ...prev, theme: updated }));
    const eventID = localStorage.getItem("eventID");
    updateEventInFirestore(eventID, { theme: updated });
    localStorage.setItem("theme", JSON.stringify(updated));
    setEditingIndex(null);
    setEditingValue("");
  };

  const removeTheme = (i) => {
    const updated = eventOptions.theme.filter((_, idx) => idx !== i);
    setEventOptions(prev => ({ ...prev, theme: updated }));
    const eventID = localStorage.getItem("eventID");
    updateEventInFirestore(eventID, { theme: updated });
    localStorage.setItem("theme", JSON.stringify(updated));
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { theme: eventOptions.theme });
  };

  return (
    <div className="container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '44%' }} />
        </div>
        <div className="progress-percentage">44%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/date" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Theme
        </h1>
      </div>

      <div className="instructions">Add theme ideas for the event.</div>

      <div className="color-block">
        <div className="event-block">
          <input
            ref={inputRef}
            className="event-input"
            placeholder="Enter a theme"
            value={themeName}
            onChange={e => setThemeName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryAddTheme()}
            onBlur={() => tryAddTheme()}
          />
        </div>
      </div>

      <div className="cohost-list">
        {eventOptions.theme?.map((name, idx) => (
          <div key={idx} className="cohost-name-box">
            {editingIndex === idx ? (
              <input
                ref={editRef}
                className="event-input"
                value={editingValue}
                onChange={e => setEditingValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && trySaveEdit()}
                onBlur={trySaveEdit}
              />
            ) : (
              <>
                {name}
                <button className="edit-button" onClick={() => setEditingIndex(idx)}>
                  Edit
                </button>
                <button className="remove-button" onClick={() => removeTheme(idx)}>
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Suggestions Section */}
      <div className="suggestions">
        <h3>Suggestions</h3>
        <div className="suggestion-tabs">
          {THEME_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`sort-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="suggestion-list">
          {THEME_SUGGESTIONS[activeCategory].map((s, idx) => {
            return (
              <button
                key={s}
                className="suggestion-item"
                onClick={() => tryAddTheme(s)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {showWarning && (
        <div className="alert-popup">Please enter a theme before continuing.</div>
      )}

      <div className="next-button-row">
        {eventOptions.theme?.length > 0 ? (
          <Link to="/venue" onClick={handleNext} className="next-button active">
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

export default Theme;
