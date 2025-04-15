import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserEvents, fetchEventByID } from './firebaseHelpers';
import { EventContext } from './EventContext';
import { CohostContext } from './CohostContext';
import './App.css';

function Events() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEvents = await fetchUserEvents(user.uid, user.email);
        setEvents(userEvents);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleContinuePlanning = async (eventID) => {
    localStorage.setItem("eventID", eventID);

    // Fetch event data from Firestore
    const eventData = await fetchEventByID(eventID);

    // Persist event fields
    if (eventData?.name) localStorage.setItem("eventName", eventData.name);
    if (eventData?.cohosts) localStorage.setItem("cohosts", JSON.stringify(eventData.cohosts));
    if (eventData?.dates) localStorage.setItem("eventDates", JSON.stringify(eventData.dates));
    if (eventData?.theme) localStorage.setItem("eventTheme", JSON.stringify(eventData.theme));
    if (eventData?.venue) localStorage.setItem("eventVenue", JSON.stringify(eventData.venue));

    navigate("/plan");
  };

  return (
    <div className="container">
      {/* Back button aligned left */}
      <Link to="/home" className="btn back-btn rounded-circle shadow-sm back-icon">
        <i
          className="bi bi-arrow-left-short"
        ></i>
      </Link>

      <h1 className="text-center">Events</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.name}</h3>
            <p>Date: {event.date || 'TBD'}</p>
            <p>Location: {event.location || 'TBD'}</p>

            <button
              className="next-button active"
              onClick={() => handleContinuePlanning(event.id)}
              style={{ backgroundColor: '#ffcf34', color: '#000' }}
            >
              Continue Planning
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Events;
