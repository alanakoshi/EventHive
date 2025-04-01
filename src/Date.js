import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from './components/Calendar'; // Import Calendar component
import './Date.css'; // Your custom styles for the Date component
import './App.css'; // Global styles

function Date() {
  const [selectedDates, setSelectedDates] = useState([]);

  // Function to toggle the selection of a date
  const toggleDate = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date)); // Deselect
    } else {
      setSelectedDates([...selectedDates, date]); // Select
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

      {/* Pass selectedDates and toggleDate to Calendar */}
      <Calendar selectedDates={selectedDates} toggleDate={toggleDate} />

      <div className="selected-dates">
        <h3>Selected Dates:</h3>
        {/* Display selected dates */}
        <div>{selectedDates.join(', ')}</div>
      </div>

      <div className="next-button">
        <Link to="/theme" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Date;
