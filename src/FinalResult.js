import { useState, useEffect, useContext } from 'react';
import { EventContext } from './EventContext';
import { Link } from 'react-router-dom';
import {
  fetchEventByID,
  fetchUserNameByUID
} from './firebaseHelpers';
import './Voting.css';
import './App.css';

function FinalResult() {
  const { eventOptions } = useContext(EventContext);
  const [finalVotes, setFinalVotes] = useState({});
  const [missingVoters, setMissingVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVotesAndCheck = async () => {
      const eventID = localStorage.getItem('eventID');
      if (!eventID) return;

      const eventData = await fetchEventByID(eventID);
      if (!eventData) return;

      const votes = eventData.votes || {};
      setFinalVotes(votes);

      const hostID = eventData.hostID;
      const cohosts = eventData.cohosts || [];

      const requiredVoterIDs = [
        hostID,
        ...cohosts.map(c => c.userID).filter(Boolean)  // only cohosts with userIDs
      ];

      const missing = [];
      for (const uid of requiredVoterIDs) {
        if (!votes[uid]) {
          const name = await fetchUserNameByUID(uid);
          missing.push(name);
        }
      }

      setMissingVoters(missing);
      setLoading(false);
    };

    loadVotesAndCheck();

    const interval = setInterval(loadVotesAndCheck, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRankedOptions = (category) => {
    const aggregated = {};

    for (const userID in finalVotes) {
      const userVotes = finalVotes[userID];
      const categoryVotes = userVotes[category];
      if (!categoryVotes) continue;

      for (const [option, score] of Object.entries(categoryVotes)) {
        aggregated[option] = (aggregated[option] || 0) + score;
      }
    }

    if (Object.keys(aggregated).length > 0) {
      return Object.entries(aggregated)
        .sort((a, b) => b[1] - a[1])
        .map(([option, score]) => ({ option, score }));
    }

    return eventOptions[category]?.map((option, index) => ({
      option,
      score: eventOptions[category].length - index
    })) || [];
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '80%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">80%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/voting" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Final Rankings</h1>
      </div>

      {Object.keys(eventOptions).map((category) => {
        const ranked = getRankedOptions(category);
        return (
          <div key={category} className="category-section">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}:</h3>
            <ol className="ranked-list">
              {ranked.map(({ option, score }, index) => (
                <li key={option} className={index === 0 ? 'top-pick' : ''}>
                  {option} <span className="score-tag">({score} pts)</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      {!loading && missingVoters.length > 0 && (
        <div className="alert-popup">
          Waiting on:
          <ul>
            {missingVoters.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="next-button-row">
        {loading ? (
          <button className="next-button disabled" disabled>Loading...</button>
        ) : missingVoters.length === 0 ? (
          <Link to="/tasks" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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

export default FinalResult;
