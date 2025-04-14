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
      <h1>Your Events</h1>
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

      <div className="next-button-row">
        <Link to="/plan" className="next-button active">
          Create New Event
        </Link>
      </div>
    </div>
  );
}

export default Events;
