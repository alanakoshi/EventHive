import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchEventByID, fetchUserNameByUID } from './firebaseHelpers';
import './Voting.css';
import './App.css';

function FinalResult() {
  const [eventOptions, setEventOptions] = useState({});
  const [finalVotes, setFinalVotes] = useState({});
  const [missingVoters, setMissingVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayLabel = (option) => {
    if (typeof option === 'string') return option;
    if (option?.name) return option.name;
    if (option?.email) return option.email;
    return 'Unknown Option';
  };

  const getAllOptionsInCategory = (category) => {
    const fromEvent = eventOptions[category] || [];
    const fromVotes = Object.values(finalVotes)
      .flatMap(vote => Object.keys(vote?.[category] || {}))
      .map(o => {
        try {
          return JSON.parse(o);
        } catch {
          return o;
        }
      });

    const combined = [...fromEvent, ...fromVotes];
    const unique = [];
    const seen = new Set();

    for (const option of combined) {
      const key = typeof option === 'string' ? option : JSON.stringify(option);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(option);
      }
    }

    return unique;
  };

  const getRankedOptions = (category) => {
    const allOptions = getAllOptionsInCategory(category);
    const scores = {};

    for (const userID in finalVotes) {
      const categoryVotes = finalVotes[userID]?.[category] || {};
      allOptions.forEach(option => {
        const key = typeof option === 'string' ? option : JSON.stringify(option);
        scores[key] = (scores[key] || 0) + (categoryVotes[key] || 0);
      });
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([rawKey, score]) => {
        let option;
        try {
          option = JSON.parse(rawKey);
        } catch {
          option = rawKey;
        }
        return { option, score };
      });
  };

  useEffect(() => {
    const loadData = async () => {
      const eventID = localStorage.getItem('eventID');
      if (!eventID) return;

      const event = await fetchEventByID(eventID);
      if (!event) return;

      setEventOptions({
        theme: event.theme || [],
        venue: event.venue || [],
        dates: event.dates || []
      });

      const votes = event.votes || {};
      setFinalVotes(votes);

      const requiredIDs = [
        event.hostID,
        ...(event.cohosts || []).map(c => c.userID).filter(Boolean),
      ];

      const missing = [];
      for (const uid of requiredIDs) {
        if (!votes[uid]) {
          const name = await fetchUserNameByUID(uid);
          missing.push(name || 'Unknown');
        }
      }

      setMissingVoters(missing);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

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
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Final Ranking</h1>
      </div>

      <div className='instructions'>
        These are the final rankings based on everyone's votes.
      </div>

      {Object.keys(eventOptions).map((category) => {
        const ranked = getRankedOptions(category);
        return (
          <div key={category} className="category-section">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}:</h3>
            <ol className="ranked-list">
              {ranked.map(({ option, score }, index) => (
                <li key={index} className={index === 0 ? 'top-pick' : ''}>
                  {displayLabel(option)} <span className="score-tag">({score} pts)</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      <div className="next-button-row">
        {loading ? (
          <button className="next-button disabled" disabled>Loading...</button>
        ) : missingVoters.length === 0 ? (
          <Link to="/tasks" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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

export default FinalResult;
