import React from 'react';
import './Calendar.css';

const Calendar = ({ selectedDates, toggleDate }) => {
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];
  
  const [month, setMonth] = React.useState(new Date().getMonth());
  const [year, setYear] = React.useState(new Date().getFullYear());

  const toggleDateInCalendar = (date) => {
    toggleDate(date);
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayOfMonth = new Date(year, month, lastDateOfMonth).getDay();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    let calendarDays = [];

    // Previous month's days
    for (let i = firstDayOfMonth; i > 0; i--) {
      calendarDays.push(
        <li key={`prev-${lastDateOfPrevMonth - i + 1}`} className="inactive">
          {lastDateOfPrevMonth - i + 1}
        </li>
      );
    }

    // Current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isSelected = selectedDates.includes(i) ? 'selected' : '';
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? 'active' : '';
      
      calendarDays.push(
        <li
          key={i}
          className={`calendar-day ${isSelected} ${isToday}`}
          onClick={() => toggleDateInCalendar(i)}
        >
          {i}
        </li>
      );
    }

    // Next month's days
    for (let i = lastDayOfMonth; i < 6; i++) {
      calendarDays.push(
        <li key={`next-${i - lastDayOfMonth + 1}`} className="inactive">
          {i - lastDayOfMonth + 1}
        </li>
      );
    }

    return calendarDays;
  };

  return (
    <div className="calendar">
      <header className="calendar-header">
        <p className="calendar-current-date">{months[month]} {year}</p>
        <div className="calendar-navigation">
          <span
            className="calendar-prev"
            onClick={() => setMonth(month - 1 < 0 ? 11 : month - 1)}
          >
            &lt;
          </span>
          <span
            className="calendar-next"
            onClick={() => setMonth(month + 1 > 11 ? 0 : month + 1)}
          >
            &gt;
          </span>
        </div>
      </header>
      <div className="calendar-body">
        <ul className="calendar-weekdays">
          <li>Sun</li>
          <li>Mon</li>
          <li>Tue</li>
          <li>Wed</li>
          <li>Thu</li>
          <li>Fri</li>
          <li>Sat</li>
        </ul>
        <ul className="calendar-dates">
          {renderCalendar()}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;