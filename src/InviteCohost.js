import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import './InviteCohost.css';
import './App.css';
import { addCohostToFirestore, updateEventInFirestore, fetchEventByID } from './firebaseHelpers';
import { auth } from './firebase';

function InviteCohost() {
  const { cohosts, setCohosts } = useContext(CohostContext);
  const [cohostName, setCohostName] = useState("");
  const [cohostEmail, setCohostEmail] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadEventData = async () => {
      const eventID = localStorage.getItem("eventID");
      if (eventID) {
        const event = await fetchEventByID(eventID);
        if (event?.cohosts) {
          setCohosts(event.cohosts);
        }
        if (event?.hostID === auth.currentUser?.uid) {
          setIsHost(true);
        }
      }
    };
    loadEventData();
  }, [setCohosts]);

  const handleAddCohost = () => {
    if (cohostName.trim() === "" || cohostEmail.trim() === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }
    setCohosts([...cohosts, { name: cohostName, email: cohostEmail }]);
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

  const removeCohost = (index) => {
    const updatedCohosts = cohosts.filter((_, i) => i !== index);
    setCohosts(updatedCohosts);
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '20%' }} />
        <div className="progress-percentage">20%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/plan" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Invite Cohost</h1>
      </div>

      {isHost && (
        <div className='color-block'>
          <div className='event-block'>
            <input
              type="text"
              placeholder="Cohost Name"
              value={cohostName}
              onChange={(e) => setCohostName(e.target.value)}
              className="event-input"
            />
            <input
              type="email"
              placeholder="Cohost Email"
              value={cohostEmail}
              onChange={(e) => setCohostEmail(e.target.value)}
              className="event-input"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCohost()}
            />
          </div>
        </div>
      )}

      <div className='cohost-list'>
        {cohosts.map((cohost, index) => (
          <div key={index} className="cohost-name-box">
            {cohost.name} ({cohost.email})
            {isHost && (
              <button className="remove-button" onClick={() => removeCohost(index)}>
                ✕
              </button>
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
