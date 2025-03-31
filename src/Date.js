import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Date.css';
import './App.css';

function Date() {
  const [selectedDates, setSelectedDates] = useState([]);

  const toggleDate = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const renderCalendar = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return days.map((day) => (
      <div
        key={day}
        className={`calendar-day ${selectedDates.includes(day) ? 'selected' : ''}`}
        onClick={() => toggleDate(day)}
      >
        {day}
      </div>
    ));
  };

  return (
    <div className='date-page'>
        <div className='progress-bar'>Progress Bar</div>
        <div className='percentage'>30%</div>
        <div className='back-button'>
            <Link to="/invite-cohost" className="button-tile">&lt;</Link>
        </div>
        <h2>Date</h2>
        <div className='calendar'>
            {renderCalendar()}
        </div>
        <div className='selected-dates'>
            <h3>Selected</h3>
            <div>March</div>
            <div>{selectedDates.join(', ')}</div>
        </div>
        <div className='next-button'>
            <Link to="/theme" className="button-tile">Next</Link>
        </div>
    </div>
  );
}

export default Date;
