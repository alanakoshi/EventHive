// InviteCohost.js
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import { auth } from './firebase';
import {
  addCohostToFirestore,
  updateEventInFirestore,
  deleteCohostFromFirestore,
  fetchEventByID
} from './firebaseHelpers';
import './InviteCohost.css';
import './App.css';

function InviteCohost() {
  const { cohosts, setCohosts } = useContext(CohostContext);
  const [cohostName, setCohostName] = useState("");
  const [cohostEmail, setCohostEmail] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // pick from a simple pastel palette
  const pastelColors = [
    '#ffd1dc','#ffecd1','#c1f0f6','#e0bbf9',
    '#d0f0c0','#fdfd96','#aec6cf','#fbc4ab',
    '#caffbf','#a0c4ff'
  ];

  // sequential: each new cohost gets the next color in the palette
  const pickPastel = () => pastelColors[cohosts.length % pastelColors.length];

  useEffect(() => {
    const eventID = localStorage.getItem("eventID");

    const loadCohosts = async () => {
      const event = await fetchEventByID(eventID);
      if (event?.cohosts) {
        setCohosts(event.cohosts);
        localStorage.setItem("cohosts", JSON.stringify(event.cohosts));
      }
      if (event?.hostID === auth.currentUser?.uid) {
        setIsHost(true);
      }
    };

    loadCohosts();
    const interval = setInterval(loadCohosts, 3000);
    return () => clearInterval(interval);
  }, [setCohosts]);

  const tryAddCohost = async () => {
    const nameTrim = cohostName.trim();
    const emailTrim = cohostEmail.trim();
    if (!nameTrim || !emailTrim) return;

    const newCohost = {
      name: nameTrim,
      email: emailTrim,
      color: pickPastel()
    };
    const updated = [...cohosts, newCohost];
    const eventID = localStorage.getItem("eventID");

    try {
      await addCohostToFirestore(eventID, nameTrim, emailTrim);
      await updateEventInFirestore(eventID, { cohosts: updated });
      setCohosts(updated);
      localStorage.setItem("cohosts", JSON.stringify(updated));
      setCohostName("");
      setCohostEmail("");
    } catch (err) {
      console.error("Failed to add cohost:", err);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { cohosts });
    setSuccessMessage("Cohosts saved successfully!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const removeCohost = async (index) => {
    const eventID = localStorage.getItem("eventID");
    const removed = cohosts[index];
    const updated = cohosts.filter((_, i) => i !== index);

    setCohosts(updated);
    localStorage.setItem("cohosts", JSON.stringify(updated));

    await updateEventInFirestore(eventID, { cohosts: updated });
    await deleteCohostFromFirestore(eventID, removed.email);
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '20%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">20%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/plan" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short" />
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Invite Cohost
        </h1>
      </div>

      <div className="instructions">
        {isHost
          ? "Invite cohosts by entering their name and email."
          : "Only the host can invite cohosts."}
      </div>

      {isHost && (
        <div className="color-block">
          <div className="event-block">
            <input
              type="text"
              placeholder="Cohost Name"
              value={cohostName}
              onChange={e => setCohostName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryAddCohost()}
              onBlur={tryAddCohost}
              className="event-input"
            />
            <input
              type="email"
              placeholder="Cohost Email"
              value={cohostEmail}
              onChange={e => setCohostEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryAddCohost()}
              onBlur={tryAddCohost}
              className="event-input"
            />
          </div>
        </div>
      )}

      <div className="cohost-list">
        {cohosts.map((co, i) => (
          <div
            key={i}
            className="cohost-name-box"
            style={{ borderLeft: `4px solid ${co.color}` }}
          >
            {co.name} ({co.email})
            {isHost && (
              <button className="remove-button" onClick={() => removeCohost(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {showWarning && (
        <div className="alert-popup">Please enter a name and email.</div>
      )}
      {successMessage && (
        <div className="success-popup">{successMessage}</div>
      )}

      <div className="next-button-row">
        {cohosts.length > 0 ? (
          <Link
            to="/date"
            onClick={isHost ? handleNext : null}
            className="next-button active"
            style={{ backgroundColor: '#ffcf34', color: '#000' }}
          >
            Next
          </Link>
        ) : (
          <button
            className="next-button disabled"
            disabled
            style={{ backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default InviteCohost;
