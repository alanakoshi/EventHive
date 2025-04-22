import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Date.css';
import './App.css';
import { updateEventInFirestore, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';

function SelectDate() {
  const { eventOptions, setEventOptions } = useContext(EventContext);
  const raw = eventOptions.dates;
  const currentEmail = auth.currentUser?.email;
  
  // Normalize old-array vs new-object
  const selectedDates = useMemo(() => {
    if (!raw) return {};
    if (Array.isArray(raw)) {
      return { [currentEmail]: raw };
    }
    return raw;
  }, [raw, currentEmail]);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [cohosts, setCohosts] = useState([]);

  const pastelColors = [
    '#ffd1dc', '#ffecd1', '#c1f0f6', '#e0bbf9',
    '#d0f0c0', '#fdfd96', '#aec6cf', '#fbc4ab',
    '#caffbf', '#a0c4ff'
  ];

  const getColorByEmail = (email) => {
    const allEmails = [currentEmail, ...cohosts.map(c => c.email)]
      .filter((e, i, arr) => arr.indexOf(e) === i);
    const idx = allEmails.indexOf(email);
    return pastelColors[idx % pastelColors.length];
  };

  useEffect(() => {
    const eventID = localStorage.getItem("eventID");
    const loadData = async () => {
      if (!eventID) return;
      const data = await fetchEventByID(eventID);
      if (data) {
        // update dates
        if (data.dates) {
          setEventOptions(prev => ({ ...prev, dates: data.dates }));
          localStorage.setItem("dates", JSON.stringify(data.dates));
        }
        // update cohosts
        if (data.cohosts) {
          setCohosts(data.cohosts);
        }
      }
    };
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [setEventOptions]);

  const toLocalDateString = date => {
    const y = date.getFullYear();
    const m = ('0'+(date.getMonth()+1)).slice(-2);
    const d = ('0'+date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  };

  const toggleDate = async day => {
    if (!day) return;
    const clicked = new Date(currentYear, currentMonth, day);
    const iso = toLocalDateString(clicked);
    const eventID = localStorage.getItem("eventID");

    // copy and toggle in the per-user array
    const updated = { ...selectedDates };
    const userSet = new Set(updated[currentEmail] || []);
    if (userSet.has(iso)) userSet.delete(iso);
    else userSet.add(iso);
    updated[currentEmail] = Array.from(userSet);

    setEventOptions(prev => ({ ...prev, dates: updated }));
    localStorage.setItem("dates", JSON.stringify(updated));
    await updateEventInFirestore(eventID, { dates: updated });
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { dates: selectedDates });
  };

  const handlePrevMonth = () => {
    let nm = currentMonth - 1, ny = currentYear;
    if (nm < 0) { nm = 11; ny--; }
    setCurrentMonth(nm);
    setCurrentYear(ny);
  };
  const handleNextMonth = () => {
    let nm = currentMonth + 1, ny = currentYear;
    if (nm > 11) { nm = 0; ny++; }
    setCurrentMonth(nm);
    setCurrentYear(ny);
  };

  // build calendar
  const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
  const firstDow  = new Date(currentYear, currentMonth, 1).getDay();
  const cells = [];
  for (let i=0; i<firstDow; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);

  const dayNames = ['S','M','T','W','T','F','S'];
  const userDates = (selectedDates[currentEmail]||[]).sort();
  const formatted = userDates.map(iso => {
    const [y,m,d] = iso.split('-');
    return new Date(y,m-1,d).toLocaleDateString('en-US', { month:'long', day:'numeric' });
  });

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width:'30%', backgroundColor:'#ffc107' }} />
        <div className="progress-percentage">30%</div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/invite-cohost" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"/>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Date</h1>
      </div>

      <div className="instructions">
        Select all dates you’re available for the event.
      </div>

      <div className="calendar-header">
        <button className="calendar-arrow" onClick={handlePrevMonth}>&lt;</button>
        <div className="calendar-month-year">
          {['January','February','March','April','May','June','July','August','September','October','November','December'][currentMonth]} {currentYear}
        </div>
        <button className="calendar-arrow" onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className="calendar-grid day-labels">
        {dayNames.map((dn,i)=><div key={i} className="day-label">{dn}</div>)}
      </div>

      <div className="calendar-grid day-cells">
        {cells.map((day,i) => {
          if (day===null) return <div key={i} className="calendar-day blank"/>;
          const iso = toLocalDateString(new Date(currentYear, currentMonth, day));
          const isToday = iso===toLocalDateString(new Date());

          // stacked pastel overlays for each cohost who selected
          const overlays = Object.entries(selectedDates)
            .filter(([_,arr]) => Array.isArray(arr) && arr.includes(iso))
            .map(([email]) => (
              <div key={email}
                   className="calendar-day-overlay"
                   style={{
                     backgroundColor: getColorByEmail(email),
                     position: 'absolute', inset: 0,
                     borderRadius: '50%'
                   }}
              />
            ));

          return (
            <div
              key={i}
              className={`calendar-day ${isToday?'today':''}`}
              onClick={()=>toggleDate(day)}
              style={{ position:'relative' }}
            >
              {overlays}
              <span className="calendar-day-number" style={{ position:'relative', zIndex:1 }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="selected-dates">
        <h3>Selected Dates:</h3>
        <div>{formatted.length>0 ? formatted.join(', ') : 'No days selected.'}</div>
      </div>

      <div className="next-button-row">
        {formatted.length>0
          ? <Link to="/theme" onClick={handleNext} className="next-button active"
                  style={{backgroundColor:'#ffcf34',color:'#000'}}>Next</Link>
          : <button className="next-button disabled" disabled
                    style={{backgroundColor:'#ccc',color:'#666',cursor:'not-allowed'}}>Next</button>
        }
      </div>
    </div>
  );
}

export default SelectDate;
