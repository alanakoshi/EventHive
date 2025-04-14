import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserEvents } from './firebaseHelpers';
import { Link } from 'react-router-dom';
import './App.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEvents = await fetchUserEvents(user.uid, user.email);
        setEvents(userEvents);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

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
          <div key={event.id} className="event-box">
            <h3>{event.name}</h3>
            <p>Date: {event.date || 'N/A'}</p>
            <p>Location: {event.location || 'N/A'}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Events;
