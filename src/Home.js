// Home.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MenuSidebar from './components/MenuSideBar';
import { fetchUserEvents, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';
import './App.css';
import './Home.css';

function Home() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEvents = await fetchUserEvents(user.uid, user.email);
        setEvents(userEvents);
      }
    };
    fetchEvents();
  }, []);

  const handleNewEvent = () => {
    localStorage.removeItem("eventID");
    localStorage.removeItem("continuePlanning");
    localStorage.removeItem("eventName");
    localStorage.removeItem("theme");
    localStorage.removeItem("dates");
    localStorage.removeItem("venue");
    localStorage.removeItem("cohosts");
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

  return (
    <div className="container">
      <div className="d-flex justify-content-center align-items-center">
        <MenuSidebar />
        <h1>EventHive</h1>
      </div>

      <div className="d-flex justify-content-center mb-4">
        <button
          className="next-button active"
          onClick={handleNewEvent}
          style={{ backgroundColor: '#ffcf34', color: '#000', marginBottom: '1rem' }}
        >
          Create New Event
        </button>
      </div>

      <h2 className="text-center">Your Events</h2>
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

export default Home;
