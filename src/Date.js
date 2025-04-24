// SelectDate.js
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Date.css';
import './App.css';
import { updateEventInFirestore, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';

function SelectDate() {
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const rawDates = eventOptions.dates;
  const currentEmail = auth.currentUser?.email;

  // Normalize rawDates into an object mapping emails → arrays
  const selectedDates = useMemo(() => {
    if (!rawDates) return {};
    if (Array.isArray(rawDates)) {
      return { [currentEmail]: rawDates };
    }
    return rawDates;
  }, [rawDates, currentEmail]);

  const [cohosts, setCohosts] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const eventID = localStorage.getItem('eventID');
    const load = async () => {
      if (!eventID) return;
      const data = await fetchEventByID(eventID);
      if (!data) return;
      if (data.dates) {
        setEventOptions(prev => ({ ...prev, dates: data.dates }));
        localStorage.setItem('dates', JSON.stringify(data.dates));
      }
      if (data.cohosts) {
        setCohosts(data.cohosts);
      }
    };
    load();
    const iv = setInterval(load, 1000);
    return () => clearInterval(iv);
  }, [setEventOptions]);

  const toIso = date => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const toggleDate = async day => {
    if (!day) return;
    const clicked = new Date(currentYear, currentMonth, day);
    const iso = toIso(clicked);
    const eventID = localStorage.getItem('eventID');

    const updated = { ...selectedDates };
    const setForUser = new Set(updated[currentEmail] || []);
    if (setForUser.has(iso)) setForUser.delete(iso);
    else setForUser.add(iso);
    updated[currentEmail] = Array.from(setForUser);

    setEventOptions(prev => ({ ...prev, dates: updated }));
    localStorage.setItem('dates', JSON.stringify(updated));
    await updateEventInFirestore(eventID, { dates: updated });
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem('eventID');
    await updateEventInFirestore(eventID, { dates: selectedDates });
  };

  const prevMonth = () => {
    let m = currentMonth - 1, y = currentYear;
    if (m < 0) { m = 11; y--; }
    setCurrentMonth(m); setCurrentYear(y);
  };
  const nextMonth = () => {
    let m = currentMonth + 1, y = currentYear;
    if (m > 11) { m = 0; y++; }
    setCurrentMonth(m); setCurrentYear(y);
  };

  // Build calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDow    = new Date(currentYear, currentMonth, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayNames = ['S','M','T','W','T','F','S'];
  const yourDates = new Set(selectedDates[currentEmail] || []);
  const formatted = Array.from(yourDates).sort().map(iso => {
    const [y,m,d] = iso.split('-');
    return new Date(y, m-1, d)
      .toLocaleDateString('en-US',{ month:'long', day:'numeric' });
  });

  const todayIso = toIso(new Date());

  return (
    <div className="container">
      {/* Progress Bar */}
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '33%' }} />
        </div>
        <div className="progress-percentage">33%</div>
      </div>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/invite-cohost"
              className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Date
        </h1>
      </div>

      <div className="instructions">
        Select all dates you’re available for the event.
      </div>

      {/* Calendar Navigation */}
      <div className="calendar-header">
        <button
          className="btn back-btn rounded-circle shadow-sm calendar-arrow back-icon"
          onClick={prevMonth}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="calendar-month-year">
          {[
            'January','February','March','April','May','June',
            'July','August','September','October','November','December'
          ][currentMonth]} {currentYear}
        </div>

        <button
          className="btn back-btn rounded-circle shadow-sm calendar-arrow back-icon"
          onClick={nextMonth}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>


      {/* Day Labels */}
      <div className="calendar-grid day-labels">
        {dayNames.map((dn,i) => (
          <div key={i} className="day-label">{dn}</div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="calendar-grid day-cells">
        {cells.map((day,i) => {
          if (day === null) return <div key={i} className="calendar-day blank"/>;
          const iso = toIso(new Date(currentYear, currentMonth, day));
          const isToday    = iso === todayIso;
          const isSelected = yourDates.has(iso);

          return (
            <div
              key={i}
              className={
                `calendar-day` +
                (isToday ? ' today' : '') +
                (isSelected ? ' selected' : '')
              }
              onClick={() => toggleDate(day)}
            >
              <span className="calendar-day-number">{day}</span>
            </div>
          );
        })}
      </div>

      {/* Selected Dates Display */}
      <div className="selected-dates">
        <h3>Selected Dates:</h3>
        <div>
          {formatted.length > 0
            ? formatted.join(', ')
            : 'No days selected.'}
        </div>
      </div>

      {/* Next Button */}
      <div className="next-button-row">
        {formatted.length > 0 ? (
          <Link to="/theme"
                className="next-button active"
                onClick={handleNext}>
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

export default SelectDate;
