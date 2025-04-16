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
    const interval = setInterval(() => {
      loadUserEvents();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
            <p>Date: {event.topDate || 'TBD'}</p>
            <p>Location: {event.topVenue || 'TBD'}</p>
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
