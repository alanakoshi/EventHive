import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Date.css';
import './App.css';
import { updateEventInFirestore, fetchEventByID } from './firebaseHelpers';

function SelectDate() {
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const selectedDates = eventOptions.dates || [];

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Load saved dates from Firestore
  useEffect(() => {
    const loadDatesFromFirestore = async () => {
      const eventID = localStorage.getItem("eventID");
      if (!eventID) return;
      const data = await fetchEventByID(eventID);
      if (data?.dates) {
        setEventOptions(prev => ({
          ...prev,
          dates: data.dates
        }));
      }
    };
    loadDatesFromFirestore();
  }, [setEventOptions]);

  const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const toggleDate = (day) => {
    if (!day) return;
    const clickedDate = new Date(currentYear, currentMonth, day);
    const isoString = toLocalDateString(clickedDate);

    if (selectedDates.includes(isoString)) {
      setEventOptions(prev => ({
        ...prev,
        dates: selectedDates.filter(d => d !== isoString)
      }));
    } else {
      setEventOptions(prev => ({
        ...prev,
        dates: [...selectedDates, isoString]
      }));
    }
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { dates: selectedDates });
  };

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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const sortedDates = [...selectedDates].sort();
  const formattedSelectedDates = sortedDates.map((iso) => {
    const [year, month, day] = iso.split('-');
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  });

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '30%' }} />
        <div className="progress-percentage">30%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/invite-cohost" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Date</h1>
      </div>

      <div className="calendar-header">
        <button className="calendar-arrow" onClick={handlePrevMonth}>&lt;</button>
        <div className="calendar-month-year">
          {[
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ][currentMonth]}
          {' '}
          {currentYear}
        </div>
        <button className="calendar-arrow" onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className="calendar-grid day-labels">
        {dayNames.map((day, idx) => (
          <div key={idx} className="day-label">{day}</div>
        ))}
      </div>

      <div className="calendar-grid day-cells">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="calendar-day blank"></div>;
          }

          const isoString = toLocalDateString(new Date(currentYear, currentMonth, day));
          const isSelected = selectedDates.includes(isoString);
          const isToday = isoString === toLocalDateString(new Date());

          return (
            <div
              key={idx}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => toggleDate(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="selected-dates">
        <h3>Selected Dates:</h3>
        <div>{formattedSelectedDates.length > 0 ? formattedSelectedDates.join(', ') : 'No days selected.'}</div>
      </div>

      <div className="next-button-row">
        {selectedDates.length > 0 ? (
          <Link to="/theme" onClick={handleNext} className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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

export default SelectDate;
