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

  const handleAddCohost = async () => {
    if (cohostEmail.trim() === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }

    const eventID = localStorage.getItem("eventID");
    await addCohostToFirestore(eventID, cohostEmail);
    
    setCohosts([...cohosts, cohostEmail]);
    setCohostEmail("");
    setSuccessMessage("Cohost added!");

    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCohost();
    }
  };

  const handleNext = async () => {
    const eventID = localStorage.getItem("eventID");
    await updateEventInFirestore(eventID, { cohosts });
  };

  const removeCohost = (index) => {
    const updated = cohosts.filter((_, i) => i !== index);
    setCohosts(updated);
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
          <button onClick={handleAddCohost} className="add-button">Add</button>
        </div>
      </div>

      <div className='cohost-list'>
        {cohosts.map((email, index) => (
          <div key={index} className="cohost-name-box">
            {email}
            <button className="remove-button" onClick={() => removeCohost(index)}>✕</button>
          </div>
        ))}
      </div>

      {showWarning && <div className="alert-popup">Please enter a cohost email before continuing.</div>}
      {successMessage && <div className="success-popup">{successMessage}</div>}

      <div className="next-button-row">
        {cohosts.length > 0 ? (
          <Link to="/date" onClick={handleNext} className="next-button active">
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled>Next</button>
        )}
      </div>
    </div>
  );
}

export default InviteCohost;
