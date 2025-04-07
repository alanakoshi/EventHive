import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Calendar from './components/Calendar';
import { EventContext } from './EventContext';
import './Date.css';
import './App.css';

function Date() {
  const { eventOptions, setEventOptions } = useContext(EventContext);

  const toggleDate = (date) => {
    const selectedDates = eventOptions.dates || [];
    if (selectedDates.includes(date)) {
      // Deselect date
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        dates: selectedDates.filter(d => d !== date),
      }));
    } else {
      // Select date
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        dates: [...selectedDates, date],
      }));
    }
  };

  return (
    <div className="date-page">
      <div className="progress-bar">Progress Bar</div>
      <div className="percentage">30%</div>
      <div className="back-button">
        <Link to="/invite-cohost" className="button-tile">&lt;</Link>
      </div>
      <h2>Date</h2>

      <Calendar selectedDates={eventOptions.dates || []} toggleDate={toggleDate} />

      <div className="selected-dates">
        <h3>Selected Dates:</h3>
        <div>{(eventOptions.dates || []).join(', ')}</div>
      </div>

      <div className="next-button">
        <Link to="/theme" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Date;
