import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";
import MenuSidebar from './components/MenuSideBar';
import { fetchUserEvents } from './firebaseHelpers';
import { auth } from './firebase';

function Home() {
  const [events, setEvents] = useState([]);

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

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center">
        <MenuSidebar />
        <h1>EventHive</h1>
      </div>

      <div className="grid-buttons">
        <Link to="/plan" className="button-tile">
          <img src={`${process.env.PUBLIC_URL}/Clipboard.svg`} alt="Plan" className="button-icon" />
          <span>Plan</span>
        </Link>

        <Link to="/events" className="button-tile">
          <img src={`${process.env.PUBLIC_URL}/Calendar.svg`} alt="Events" className="button-icon" />
          <span>Events</span>
        </Link>
      </div>
    </div>
  );
}

export default Home;
