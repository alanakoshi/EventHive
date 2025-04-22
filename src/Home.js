import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserEvents, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';
import MenuSidebar from './components/MenuSideBar';
import './App.css';
import './Home.css';

function Home() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const getTopVotedOption = (votes, category) => {
    const scoreMap = {};
    Object.values(votes || {}).forEach(userVotes => {
      const categoryVotes = userVotes?.[category];
      if (categoryVotes) {
        Object.entries(categoryVotes).forEach(([option, score]) => {
          scoreMap[option] = (scoreMap[option] || 0) + score;
        });
      }
    });
    const sorted = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  };

  const loadUserEvents = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userEvents = await fetchUserEvents(user.uid, user.email);
    const enrichedEvents = await Promise.all(userEvents.map(async (event) => {
      const fullEvent = await fetchEventByID(event.id);
      const topDate = getTopVotedOption(fullEvent.votes, 'dates');
      const topVenue = getTopVotedOption(fullEvent.votes, 'venue');
      return {
        ...event,
        topDate,
        topVenue,
      };
    }));

    setEvents(enrichedEvents);
  };

  useEffect(() => {
    loadUserEvents();
    const interval = setInterval(loadUserEvents, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const filteredEvents = events.filter(ev => {
    if (!ev.rawDate) return false;
    const d = new Date(ev.rawDate);
    switch (filter) {
      case 'Month':
        return d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
      case 'Day':
        return d.toDateString() === today.toDateString();
      case 'Year':
        return d.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });

  const formatDateBox = (dateString) => {
    if (!dateString) return null;
    const [y,m,d] = dateString.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return (
      <div className="date-box">
        <div className="date-day">{day}</div>
        <div className="date-month">{month.toUpperCase()}</div>
      </div>
    );
  };  

  const handleNewEvent = () => {
    localStorage.clear();
    navigate("/plan");
  };

  const handleContinuePlanning = async (eventID) => {
    const eventData = await fetchEventByID(eventID);
    if (eventData) {
      localStorage.setItem("eventID", eventID);
      localStorage.setItem("continuePlanning", "true");
      localStorage.setItem("eventName", eventData.name || "");
      localStorage.setItem("theme", JSON.stringify(eventData.theme || []));
      localStorage.setItem("dates", JSON.stringify(eventData.dates || []));
      localStorage.setItem("venue", JSON.stringify(eventData.venue || []));
      localStorage.setItem("cohosts", JSON.stringify(eventData.cohosts || []));
    }
    navigate("/plan");
  };

  const user = auth.currentUser;
  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || 'A';
  const userEmail = user?.email || '';

  const pastelColors = [
    '#ffd1dc', '#ffecd1', '#c1f0f6', '#e0bbf9', '#d0f0c0', '#fdfd96', '#aec6cf', '#fbc4ab', '#caffbf', '#a0c4ff'
  ];

  const getCohostColor = (email, cohostList) => {
    const index = cohostList.findIndex(co => co.email === email);
    return pastelColors[index % pastelColors.length];
  };

  return (
    <div className="homepage-container">
      <div className="header-row align-center">
        <h1 className="homepage-title">Planned<br />Events</h1>
        <img src={process.env.PUBLIC_URL + '/EventHiveLogo.svg'} alt="Event Hive logo" className="logo-icon small-top-right" />
      </div>

      {/* SORT‑BY CONTROLS */}
      <div className="sort-by-row">
        <span className="sort-label">Sort By</span>
        {['All','Month','Day','Year'].map(key => (
          <button
            key={key}
            className={`sort-btn ${filter===key?'active':''}`}
            onClick={()=>setFilter(key)}
          >
            {key}
          </button>
        ))}
      </div>
      
      <div className="events-list">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card-home" onClick={() => handleContinuePlanning(event.id)}>
              <div className="event-img-box">
                {formatDateBox(event.topDate)}
                <img
                  src={process.env.PUBLIC_URL + '/event-placeholder.png'}
                  alt="Event banner"
                  className="event-img"
                />
              </div>
              <div className="event-info-box">
                <div className="event-name">{event.name}</div>
                <div className="event-location">
                  <img src={process.env.PUBLIC_URL + '/location.svg'} style={{ marginRight: '6px' }} />
                  {event.topVenue || 'TBD'}
                </div>
                <div className="cohost-icons">
                  Planned with
                  {event.cohosts?.map((cohost, index) => (
                    <span
                      key={index}
                      className="circle-avatar"
                      style={{ backgroundColor: getCohostColor(cohost.email, event.cohosts) }}
                    >
                      {cohost.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-icon" onClick={() => navigate("/home")}> 
          <img src={process.env.PUBLIC_URL + '/home.svg'} alt="Home" />
        </button>
        <button className="nav-icon add-button" onClick={handleNewEvent}>
          <img src={process.env.PUBLIC_URL + '/CreateEvent.svg'} alt="Create New Event" />
        </button>
        <div className="avatar-circle" onClick={() => setIsSidebarOpen(true)}>
          {userInitial}
        </div>
      </div>

      <MenuSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userEmail={userEmail} userInitial={userInitial} />
    </div>
  );
}

export default Home;