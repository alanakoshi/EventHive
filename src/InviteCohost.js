import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import './InviteCohost.css';
import './App.css';
import { addCohostToFirestore, updateEventInFirestore } from './firebaseHelpers';
import { auth } from './firebase';

function InviteCohost() {
  const { cohosts, setCohosts } = useContext(CohostContext);
  const [cohostEmail, setCohostEmail] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    setCohostEmail(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (cohostEmail.trim() === "") {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      } else {
        setCohosts([...cohosts, cohostEmail]);
        setCohostEmail("");
      }
    }
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    console.log("Saving Cohosts for Event:", eventID);
    console.log("Current User:", auth.currentUser?.uid);
    console.log("Cohost Emails:", cohosts);

    await updateEventInFirestore(eventID, { cohosts });

    for (const email of cohosts) {
      console.log("Adding Cohost:", email);
      await addCohostToFirestore(eventID, email);
    }

    setSuccessMessage("Cohosts saved successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000); // Hide after 2 seconds
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

      <div className='color-block'>
        <div className='event-block'>
          <input
            type="email"
            placeholder="Enter cohost email"
            value={cohostEmail}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="event-input"
          />
        </div>
      </div>

      <div className='cohost-list'>
        {cohosts.map((email, index) => (
          <div key={index} className="cohost-name-box">
            {email}
            <button className="remove-button" onClick={() => removeCohost(index)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {showWarning && (
        <div className="alert-popup">
          Please enter a cohost email before continuing.
        </div>
      )}

      {successMessage && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}

      <div className="next-button-row">
        {cohosts.length > 0 ? (
          <Link to="/date" onClick={handleNext} className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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
