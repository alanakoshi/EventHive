// Home.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate }            from 'react-router-dom';
import {
  fetchUserEvents,
  fetchEventByID,
  deleteEventFromFirestore
} from './firebaseHelpers';
import { auth }                        from './firebase';
import { onAuthStateChanged }          from 'firebase/auth';
import MenuSidebar                     from './components/MenuSideBar';
import './App.css';
import './Home.css';

const THEME_IMAGES = {
  'Cinnamoroll':   `${process.env.PUBLIC_URL}/Cinnamoroll.png`,
  'Smiski':        `${process.env.PUBLIC_URL}/Smiski.png`,
  'Pom Pom Purin': `${process.env.PUBLIC_URL}/Pom%20Pom%20Purin.jpeg`,
  'Mickey':        `${process.env.PUBLIC_URL}/Mickey.jpg`,
  'Frozen':        `${process.env.PUBLIC_URL}/Frozen.jpg`,
  'Moana':         `${process.env.PUBLIC_URL}/Moana.jpg`,
  'Studio 54':     `${process.env.PUBLIC_URL}/Studio%2054.jpg`,
  'Mirror Ball':   `${process.env.PUBLIC_URL}/Mirror%20Ball.jpg`,
  '70s Funk':      `${process.env.PUBLIC_URL}/70s%20Funk.jpg`,
};
const DEFAULT_EVENT_IMAGE = process.env.PUBLIC_URL + '/default-theme.png';

function Home() {
  const [user, setUser]           = useState(null);
  const [events, setEvents]       = useState([]);
  const [filter, setFilter]       = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate                  = useNavigate();
  const today                     = new Date();

  // Subscribe to auth state, then load and enrich events
  useEffect(() => {
    let intervalId;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setEvents([]);
        return;
      }
      setUser(currentUser);

      const load = async () => {
        const userEvents = await fetchUserEvents(currentUser.uid, currentUser.email);
        const enriched = await Promise.all(
          userEvents.map(async ev => {
            const full    = await fetchEventByID(ev.id);
            const tasks   = full?.tasks || [];

            // Compute topDate
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

            // Compute topVenue
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

            // Compute topTheme
            const topTheme = (() => {
              const scores = {};
              Object.values(full?.votes || {}).forEach(u =>
                u.theme && Object.entries(u.theme).forEach(([opt, sc]) =>
                  scores[opt] = (scores[opt]||0) + sc
                )
              );
              return Object.entries(scores)
                .sort(([,a],[,b]) => b - a)[0]?.[0] || null;
            })();

            return {
              id:       ev.id,
              name:     ev.name,
              cohosts:  full?.cohosts || [],
              topDate,
              topVenue,
              tasks,
              topTheme,
              hostID:   full?.hostID
            };
          })
        );
        setEvents(enriched);
      };

      load();
      intervalId = setInterval(load, 1000);
    });

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // Sort by chosen date (topDate), undated last
  const allSorted = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = a.topDate ? new Date(a.topDate) : null;
      const db = b.topDate ? new Date(b.topDate) : null;
      if (da && db) return da - db;
      if (da)      return -1;
      if (db)      return 1;
      return 0;
    });
  }, [events]);

  // Derive filtered lists
  const upcoming   = useMemo(() => allSorted.filter(e => e.topDate && new Date(e.topDate) >= today), [allSorted, today]);
  const past       = useMemo(() => allSorted.filter(e => e.topDate && new Date(e.topDate) <  today), [allSorted, today]);
  const undated    = useMemo(() => allSorted.filter(e => !e.topDate), [allSorted]);
  const unfinished = useMemo(() => allSorted.filter(e => e.tasks.some(t => !t.completed)), [allSorted]);

  // Grouping helper
  const groupBy = (list, labelFn) =>
    list.reduce((acc, ev) => {
      const lbl = labelFn(ev);
      (acc[lbl] = acc[lbl]||[]).push(ev);
      return acc;
    }, {});

  const monthYear = ds =>
    ds
      ? new Date(ds).toLocaleString('default',{month:'long',year:'numeric'})
      : 'No Date Yet';

  // Build groupings
  const groupedAll      = useMemo(() => groupBy(allSorted,      ev => monthYear(ev.topDate)), [allSorted]);
  const groupedUpcoming = useMemo(() => groupBy(upcoming,       ev => monthYear(ev.topDate)), [upcoming]);
  const groupedPast     = useMemo(() => groupBy(past,           ev => monthYear(ev.topDate)), [past]);
  const groupedUndated  = { 'No Date Yet': undated };
  const groupedUnfin    = useMemo(() => groupBy(unfinished,     ev => monthYear(ev.topDate)), [unfinished]);

  let groups = groupedAll;
  switch(filter){
    case 'Upcoming':    groups = groupedUpcoming; break;
    case 'Past':        groups = groupedPast;     break;
    case 'No Date Yet': groups = groupedUndated;  break;
    case 'Unfinished':  groups = groupedUnfin;    break;
    default:            groups = groupedAll;      break;
  }

  // Format the date-box
  const formatDateBox = ds => {
    if (!ds) return null;
    const [y, m, d] = ds.split('-');
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

  const pastel = ['#ffd1dc','#ffecd1','#c1f0f6','#e0bbf9','#c0f0c0','#fdfd96','#aec6cf','#fbc4ab','#caffbf','#a0c4ff'];
  const getCohostColor = (email, list) =>
    pastel[list.findIndex(c => c.email === email) % pastel.length];

  // Delete handler
  const handleDelete = async (e, eventID) => {
    e.stopPropagation();
    if (window.confirm('Delete this event?')) {
      await deleteEventFromFirestore(eventID);
      if (user) setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleNew      = () => { localStorage.clear(); navigate('/plan'); };
  const handleContinue = id => { localStorage.setItem('eventID', id); navigate('/plan'); };

  return (
    <div className="homepage-container">
      {/* Header */}
      <div className="header-row align-center">
        <h1 className="homepage-title">Planned<br/>Events</h1>
        <img src={process.env.PUBLIC_URL + '/EventHiveLogo.svg'} alt="logo" className="logo-icon small-top-right"/>
      </div>

      {/* Filter Buttons */}
      <div className="sort-label">View</div>
      <div className="sort-by-row">
        {['All','Upcoming','Past','No Date Yet','Unfinished'].map(key => (
          <button
            key={key}
            className={`sort-btn ${filter === key ? 'active' : ''}`}
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
            {evs.map(ev => {
              const imgUrl = ev.topTheme && THEME_IMAGES[ev.topTheme]
                ? THEME_IMAGES[ev.topTheme]
                : DEFAULT_EVENT_IMAGE;

              return (
                <div
                  key={ev.id}
                  className="event-card-home"
                  onClick={() => handleContinue(ev.id)}
                >
                  {/* Host-only menu */}
                  {user?.uid === ev.hostID && (
                    <button
                    className="event-menu-btn"
                    onClick={e => handleDelete(e, ev.id)}
                    aria-label="Event menu"
                  >
                    ⋮
                  </button>
                  )}

                  <div className="event-img-box">
                    {formatDateBox(ev.topDate)}
                    <img src={imgUrl} alt="banner" className="event-img"/>
                  </div>
                  <div className="event-info-box">
                    <div className="event-name">{ev.name}</div>
                    <div className="event-location">
                      <img src={process.env.PUBLIC_URL + '/location.svg'} style={{marginRight:6}}/>
                      {ev.topVenue || 'TBD'}
                    </div>
                    <div className="cohost-icons">
                      Planned with
                      {ev.cohosts.map((c,i) => (
                        <span
                          key={i}
                          className="circle-avatar"
                          style={{backgroundColor:getCohostColor(c.email, ev.cohosts)}}
                        >{c.name.charAt(0).toUpperCase()||'?'}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
        {!Object.keys(groups).length && <p>No events in this view.</p>}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-icon" onClick={() => navigate('/home')}>
          <img src={process.env.PUBLIC_URL + '/home.svg'} alt="Home"/>
        </button>
        <button className="nav-icon add-button" onClick={handleNew}>
          <img src={process.env.PUBLIC_URL + '/CreateEvent.svg'} alt="New"/>
        </button>
        <div className="avatar-circle" onClick={() => setIsSidebarOpen(true)}>
          {user?.displayName?.charAt(0).toUpperCase()||'A'}
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
