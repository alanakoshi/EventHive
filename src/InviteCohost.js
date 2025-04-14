import { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import './InviteCohost.css';
import './App.css';

function InviteCohost() {
  const { cohosts, setCohosts } = useContext(CohostContext);
  const [cohostName, setCohostName] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
  const editRef = useRef(null);

  const handleInputChange = (e) => setCohostName(e.target.value);

  const tryAddCohost = () => {
    const trimmed = cohostName.trim();
    if (trimmed === "") {
      // only show warning if the input is empty and there's no edit in progress
      return;
    } else {
      setCohosts([...cohosts, trimmed]);
      setCohostName("");
      setShowWarning(false); // hide warning if it was previously shown
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') tryAddCohost();
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(cohosts[index]);
    setTimeout(() => {
      editRef.current?.focus();
    }, 0);
  };

  const handleEditChange = (e) => setEditingValue(e.target.value);

  const trySaveEdit = () => {
    if (editingValue.trim() === "") {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
    } else {
      const updated = [...cohosts];
      updated[editingIndex] = editingValue.trim();
      setCohosts(updated);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const removeCohost = (index) => {
    const updatedCohosts = cohosts.filter((_, i) => i !== index);
    setCohosts(updatedCohosts);
  };

  return (
    <div className="container">
      {/* Progress bar section */}
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
            type="text" 
            placeholder="Enter cohost name" 
            value={cohostName} 
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={tryAddCohost}
            className="event-input"
            ref={inputRef}
          />
        </div>
      </div>

      <div className='cohost-list'>
        {cohosts.map((name, index) => (
          <div key={index} className="cohost-name-box">
            {editingIndex === index ? (
              <input
                type="text"
                value={editingValue}
                onChange={handleEditChange}
                onBlur={trySaveEdit}
                onKeyDown={(e) => e.key === 'Enter' && trySaveEdit()}
                ref={editRef}
                className="event-input"
              />
            ) : (
              <>
                {name}
                <button 
                  className="edit-button" 
                  onClick={() => handleEditClick(index)}
                >
                  Edit
                </button>
                <button 
                  className="remove-button" 
                  onClick={() => removeCohost(index)}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showWarning && cohosts.length === 0 && (
        <div className="alert-popup">
          Please enter a cohost name before continuing.
        </div>
      )}

      <div className="next-button-row">
        {cohosts.length > 0 ? (
          <Link to="/date" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled style={{ backgroundColor: '#ccc', color: '#666' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default InviteCohost;