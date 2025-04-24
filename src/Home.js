// Home.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserEvents, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';
import MenuSidebar from './components/MenuSideBar';
import './App.css';
import './Home.css';

function Home() {
  const [events, setEvents]               = useState([]);
  const [filter, setFilter]               = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate                          = useNavigate();
  const user                              = auth.currentUser;
  const today                             = new Date();

  // Load & enrich events
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const userEvents = await fetchUserEvents(user.uid, user.email);
      const enriched = await Promise.all(
        userEvents.map(async ev => {
          const full    = await fetchEventByID(ev.id);
          const rawDate = full?.dates
            ? Object.values(full.dates)[0]?.[0]
            : null;

          // compute topDate
          const topDate = (() => {
            const scores = {};
            Object.values(full?.votes || {}).forEach(u =>
              u.dates && Object.entries(u.dates).forEach(([opt, sc]) =>
                scores[opt] = (scores[opt]||0) + sc
              )
            );
            return Object.entries(scores)
              .sort(([,a],[,b]) => b - a)[0]?.[0] || null;
          })();

          // compute topVenue
          const topVenue = (() => {
            const scores = {};
            Object.values(full?.votes || {}).forEach(u =>
              u.venue && Object.entries(u.venue).forEach(([opt, sc]) =>
                scores[opt] = (scores[opt]||0) + sc
              )
            );
            return Object.entries(scores)
              .sort(([,a],[,b]) => b - a)[0]?.[0] || null;
          })();

          return {
            id:      ev.id,
            name:    ev.name,
            cohosts: full?.cohosts || [],
            rawDate,
            topDate,
            topVenue,
            tasks:   full?.tasks   || []  // include tasks for unfinished filter
          };
        })
      );
      setEvents(enriched);
    };

    load();
    const iv = setInterval(load, 1000);
    return () => clearInterval(iv);
  }, [user]);

  // Sort all by date (undated last)
  const allSorted = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = a.rawDate ? new Date(a.rawDate) : null;
      const db = b.rawDate ? new Date(b.rawDate) : null;
      if (da && db) return da - db;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });
  }, [events]);

  // Derive lists
  const upcoming  = useMemo(
    () => allSorted.filter(e => e.rawDate && new Date(e.rawDate) >= today),
    [allSorted, today]
  );
  const past      = useMemo(
    () => allSorted.filter(e => e.rawDate && new Date(e.rawDate) < today),
    [allSorted, today]
  );
  const undated   = useMemo(
    () => allSorted.filter(e => !e.rawDate),
    [allSorted]
  );
  const unfinished = useMemo(
    () => allSorted.filter(e => e.tasks.some(t => !t.completed)),
    [allSorted]
  );

  // Grouping helper
  const groupBy = (list, labelFn) => {
    return list.reduce((acc, ev) => {
      const label = labelFn(ev);
      if (!acc[label]) acc[label] = [];
      acc[label].push(ev);
      return acc;
    }, {});
  };

  // Build groupings with "Month Year" or "No Date Yet"
  const monthYearLabel = ds =>
    ds
      ? new Date(ds).toLocaleString('default', {
          month: 'long',
          year: 'numeric'
        })
      : 'No Date Yet';

  const groupedAll      = useMemo(() => groupBy(allSorted,      ev => monthYearLabel(ev.rawDate)), [allSorted]);
  const groupedUpcoming = useMemo(() => groupBy(upcoming,       ev => monthYearLabel(ev.rawDate)), [upcoming]);
  const groupedPast     = useMemo(() => groupBy(past,           ev => monthYearLabel(ev.rawDate)), [past]);
  const groupedUndated  = { 'No Date Yet': undated };
  const groupedUnfin    = useMemo(() => groupBy(unfinished,     ev => monthYearLabel(ev.rawDate)), [unfinished]);

  // Choose grouping based on filter
  let groups = groupedAll;
  switch (filter) {
    case 'Upcoming':    groups = groupedUpcoming; break;
    case 'Past':        groups = groupedPast;     break;
    case 'No Date Yet': groups = groupedUndated;  break;
    case 'Unfinished':  groups = groupedUnfin;    break;
    default:            groups = groupedAll;      break;
  }

  // Render helpers
  const formatDateBox = ds => {
    if (!ds) return null;
    const [y,m,d] = ds.split('-');
    const dt = new Date(+y, +m - 1, +d);
    return (
      <div className="date-box">
        <div className="date-day">{dt.getDate()}</div>
        <div className="date-month">
          {dt.toLocaleString('default',{month:'short'}).toUpperCase()}
        </div>
      </div>
    );
  };
  const pastel = [
    '#ffd1dc','#ffecd1','#c1f0f6','#e0bbf9','#d0f0c0',
    '#fdfd96','#aec6cf','#fbc4ab','#caffbf','#a0c4ff'
  ];
  const getCohostColor = (email,list) =>
    pastel[list.findIndex(c=>c.email===email)%pastel.length];

  const handleNew = () => {
    localStorage.clear();
    navigate('/plan');
  };
  const handleContinue = id => {
    localStorage.setItem('eventID', id);
    navigate('/plan');
  };

  return (
    <div className="homepage-container">
      {/* Header */}
      <div className="header-row align-center">
        <h1 className="homepage-title">Planned<br/>Events</h1>
        <img
          src={process.env.PUBLIC_URL + '/EventHiveLogo.svg'}
          alt="logo"
          className="logo-icon small-top-right"
        />
      </div>

      {/* Filter Buttons */}
      <div className="sort-label">View</div>
      <div className="sort-by-row">
        {['All','Upcoming','Past','No Date Yet','Unfinished'].map(key => (
          <button
            key={key}
            className={`sort-btn ${filter===key?'active':''}`}
            onClick={() => setFilter(key)}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="events-list">
        {Object.entries(groups).map(([label, evs]) => (
          <React.Fragment key={label}>
            <h2>{label}</h2>
            {evs.map(ev => (
              <div
                key={ev.id}
                className="event-card-home"
                onClick={() => handleContinue(ev.id)}
              >
                <div className="event-img-box">
                  {formatDateBox(ev.topDate)}
                  <img
                    src={process.env.PUBLIC_URL + '/event-placeholder.png'}
                    alt="banner"
                    className="event-img"
                  />
                </div>
                <div className="event-info-box">
                  <div className="event-name">{ev.name}</div>
                  <div className="event-location">
                    <img
                      src={process.env.PUBLIC_URL + '/location.svg'}
                      style={{ marginRight: 6 }}
                    />
                    {ev.topVenue || 'TBD'}
                  </div>
                  <div className="cohost-icons">
                    Planned with
                    {ev.cohosts.map((c,i) => (
                      <span
                        key={i}
                        className="circle-avatar"
                        style={{
                          backgroundColor: getCohostColor(c.email, ev.cohosts)
                        }}
                      >
                        {c.name.charAt(0).toUpperCase() || '?'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
        {!Object.keys(groups).length && <p>No events in this view.</p>}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-icon" onClick={() => navigate('/home')}>
          <img src={process.env.PUBLIC_URL + '/home.svg'} alt="Home" />
        </button>
        <button className="nav-icon add-button" onClick={handleNew}>
          <img src={process.env.PUBLIC_URL + '/CreateEvent.svg'} alt="New" />
        </button>
        <div className="avatar-circle" onClick={() => setIsSidebarOpen(true)}>
          {user?.displayName?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>

      <MenuSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userEmail={user?.email}
        userInitial={user?.displayName?.charAt(0).toUpperCase()}
      />
    </div>
  );
}

export default Home;
