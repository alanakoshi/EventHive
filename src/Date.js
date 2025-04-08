import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Date.css';
import './App.css';

function Date() {
  // Access selected dates from the EventContext.
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const selectedDates = eventOptions.dates || [];

  // Helper function to produce a local date string "YYYY-MM-DD" using local values.
  const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  // Maintain local state for the current month and year using the global Date via window.Date.
  const [currentMonth, setCurrentMonth] = useState(new window.Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new window.Date().getFullYear());

  // Toggle date selection.
  const toggleDate = (day) => {
    if (!day) return; // safeguard for blank cells

    const clickedDate = new window.Date(currentYear, currentMonth, day);
    const isoString = toLocalDateString(clickedDate);

    if (selectedDates.includes(isoString)) {
      // Deselect the date.
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        dates: selectedDates.filter((d) => d !== isoString),
      }));
    } else {
      // Select the date.
      setEventOptions((prevOptions) => ({
        ...prevOptions,
        dates: [...selectedDates, isoString],
      }));
    }
  };

  // Month navigation handlers.
  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Build the calendar grid.
  const daysInMonth = new window.Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new window.Date(currentYear, currentMonth, 1).getDay();
  
  // Prepare an array of cells for the calendar grid.
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null); // empty cells before day 1
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Array for day-of-week labels.
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Sort and format selected ISO dates.
  // Instead of parsing the string directly (which treats "YYYY-MM-DD" as UTC),
  // we split it and create a local date.
  const sortedDates = [...selectedDates].sort(); // "YYYY-MM-DD" strings sort naturally.
  const formattedSelectedDates = sortedDates.map((iso) => {
    const [year, month, day] = iso.split('-'); 
    const dateObj = new window.Date(year, month - 1, day); // create local date
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  });

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '30%' }} />
        <div className="progress-percentage">30%</div>
      </div>
      
      {/* Back Button */}
      <div className="back-button">
        <Link to="/invite-cohost" className="button-tile">&lt;</Link>
      </div>
      
      {/* Title */}
      <h2>Date</h2>
      
      {/* Month/Year Navigation Header */}
      <div className="calendar-header">
        <button className="calendar-arrow" onClick={handlePrevMonth}>&lt;</button>
        <div className="calendar-month-year">
          <span className="calendar-month">
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ][currentMonth]}
          </span>
          <span className="calendar-year">{currentYear}</span>
        </div>
        <button className="calendar-arrow" onClick={handleNextMonth}>&gt;</button>
      </div>
      
      {/* Day-of-week Labels */}
      <div className="calendar-grid day-labels">
        {dayNames.map((day, idx) => (
          <div key={idx} className="day-label">{day}</div>
        ))}
      </div>
      
      {/* Calendar Day Cells */}
      <div className="calendar-grid day-cells">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="calendar-day blank"></div>;
          }
          // Build the local date string for this day using local date values.
          const isoString = toLocalDateString(new window.Date(currentYear, currentMonth, day));
          const isSelected = selectedDates.includes(isoString);
          return (
            <div
              key={idx}
              className={`calendar-day ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleDate(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
      
      {/* Selected Dates Display */}
      <div className="selected-dates">
        <h3>Selected Dates:</h3>
        <div>
          {formattedSelectedDates.length > 0
            ? formattedSelectedDates.join(', ')
            : 'No days selected.'}
        </div>
      </div>
      
      {/* Next Button */}
      <div className="next-button">
        <Link to="/theme" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

export default Date;
