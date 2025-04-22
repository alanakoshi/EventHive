import { useState, useContext, useEffect } from 'react';
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
    const interval = setInterval(loadCohosts, 3000); // auto-refresh every 3s
    return () => clearInterval(interval);
  }, [setCohosts]);

  const handleAddCohost = () => {
    if (cohostName.trim() === "" || cohostEmail.trim() === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }

    const newCohosts = [...cohosts, { name: cohostName, email: cohostEmail }];
    setCohosts(newCohosts);
    localStorage.setItem("cohosts", JSON.stringify(newCohosts));
    setCohostName("");
    setCohostEmail("");
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");

    await updateEventInFirestore(eventID, { cohosts });

    for (const cohost of cohosts) {
      await addCohostToFirestore(eventID, cohost.name, cohost.email);
    }

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
  
    // 🔥 Delete from cohosts collection
    await deleteCohostFromFirestore(eventID, removed.email);
  };

  const tryAddCohost = async () => {
    const trimmedName = cohostName.trim();
    const trimmedEmail = cohostEmail.trim();
    const eventID = localStorage.getItem("eventID");
  
    if (trimmedName === "" || trimmedEmail === "") return;
  
    const newCohost = { name: trimmedName, email: trimmedEmail };
    const updatedCohosts = [...cohosts, newCohost];
  
    try {
      // First: add to the cohosts collection (avoids duplicates automatically)
      await addCohostToFirestore(eventID, trimmedName, trimmedEmail);
  
      // Then: update the event document's cohosts array
      await updateEventInFirestore(eventID, { cohosts: updatedCohosts });
  
      // Then: update local state and UI
      setCohosts(updatedCohosts);
      localStorage.setItem("cohosts", JSON.stringify(updatedCohosts));
      setCohostName("");
      setCohostEmail("");
    } catch (err) {
      console.error("Failed to add cohost:", err);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };  

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '20%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">20%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/plan" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Invite Cohost</h1>
      </div>

      <div className='instructions'>
        {isHost
          ? "Invite cohosts by entering their name and email."
          : "Only the host can invite cohosts."}
      </div>


      {isHost && (
        <div className='color-block'>
          <div className='event-block'>
            <input
              type="text"
              placeholder="Cohost Name"
              value={cohostName}
              onChange={(e) => setCohostName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryAddCohost()}
              onBlur={tryAddCohost}
              className="event-input"
            />
            <input
              type="email"
              placeholder="Cohost Email"
              value={cohostEmail}
              onChange={(e) => setCohostEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryAddCohost()}
              onBlur={tryAddCohost}
              className="event-input"
            />
          </div>
        </div>
      )}

      <div className='cohost-list'>
        {cohosts.map((cohost, index) => (
          <div key={index} className="cohost-name-box">
            {cohost.name} ({cohost.email})
            {isHost && (
              <button className="remove-button" onClick={() => removeCohost(index)}>✕</button>
            )}
          </div>
        ))}
      </div>

      {showWarning && <div className="alert-popup">Please enter a name and email.</div>}
      {successMessage && <div className="success-popup">{successMessage}</div>}

      <div className="next-button-row">
        {cohosts.length > 0 ? (
          <Link to="/date" onClick={isHost ? handleNext : null} className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled style={{ backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default InviteCohost;
