import React from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";
import MenuSidebar from './components/MenuSideBar';
import { useEffect, useState } from 'react';
import { fetchUserEvents } from './firebaseHelpers';
import { auth } from './firebase';

function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const eventsData = await fetchUserEvents(user.uid);
      setEvents(eventsData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center">
        <MenuSidebar />
        <h1>EventHive</h1>
      </div>
      <div className="grid-buttons">
        <Link to="/plan" className="button-tile">
          <img src="./Clipboard.svg" alt="Plan" className="button-icon" />
          <span>Plan</span>
        </Link>
        <Link to="/events" className="button-tile">
          <img src="./Calendar.svg" alt="Events" className="button-icon" />
          <span>Events</span>
        </Link>
      </div>
    </div>
  );
}

export default Home;
