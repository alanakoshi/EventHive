// FinalResult.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchEventByID, fetchUserNameByUID } from './firebaseHelpers';
import './Voting.css';
import './App.css';

function FinalResult() {
  const [eventOptions, setEventOptions]   = useState({ theme: [], venue: [], dates: [] });
  const [finalVotes, setFinalVotes]       = useState({});
  const [missingVoters, setMissingVoters] = useState([]);
  const [loading, setLoading]             = useState(true);

  // Helper to display a label from either a string or object
  const displayLabel = (opt) => {
    if (typeof opt === 'string') return opt;
    if (opt?.name)                return opt.name;
    if (opt?.email)               return opt.email;
    return 'Unknown';
  };

  // Collect all unique options from event + votes
  const getAllOptionsInCategory = (cat) => {
    const fromEvent = eventOptions[cat] || [];
    const fromVotes = Object.values(finalVotes)
      .flatMap(userVote => Object.keys(userVote?.[cat] || {}))
      .map(raw => {
        try { return JSON.parse(raw); }
        catch { return raw; }
      });

    const all = [...fromEvent, ...fromVotes];
    const uniq = [];
    const seen = new Set();
    for (const o of all) {
      const key = typeof o === 'string' ? o : JSON.stringify(o);
      if (!seen.has(key)) {
        seen.add(key);
        uniq.push(o);
      }
    }
    return uniq;
  };

  // Sum up scores and sort descending
  const getRanked = (cat) => {
    const opts = getAllOptionsInCategory(cat);
    const scores = {};
    for (const uid in finalVotes) {
      const votes = finalVotes[uid]?.[cat] || {};
      opts.forEach(o => {
        const key = typeof o === 'string' ? o : JSON.stringify(o);
        scores[key] = (scores[key] || 0) + (votes[key] || 0);
      });
    }
    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([raw, sc]) => {
        let o;
        try { o = JSON.parse(raw); }
        catch { o = raw; }
        return { option: o, score: sc };
      });
  };

  useEffect(() => {
    const load = async () => {
      const eventID = localStorage.getItem('eventID');
      if (!eventID) return;
      const ev = await fetchEventByID(eventID);
      if (!ev) return;

      // normalize theme & venue
      const theme = Array.isArray(ev.theme) ? ev.theme : [];
      const venue = Array.isArray(ev.venue) ? ev.venue : [];

      // --- intersect everybody's dates ---
      let dates = [];
      const rawDates = ev.dates || {};
      if (typeof rawDates === 'object' && !Array.isArray(rawDates)) {
        const lists = Object.values(rawDates).filter(Array.isArray);
        if (lists.length) {
          dates = lists.reduce((common, arr) =>
            common.filter(d => arr.includes(d))
          , lists[0]);
        }
      } else if (Array.isArray(rawDates)) {
        dates = rawDates;
      }

      setEventOptions({ theme, venue, dates });
      setFinalVotes(ev.votes || {});

      // build missing voters list
      const required = [
        ev.hostID,
        ...(ev.cohosts || []).map(c => c.userID).filter(Boolean)
      ];
      const miss = [];
      for (const uid of required) {
        if (!ev.votes?.[uid]) {
          const name = await fetchUserNameByUID(uid);
          miss.push(name || 'Unknown');
        }
      }
      setMissingVoters(miss);
      setLoading(false);
    };

    load();
    const iv = setInterval(load, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '70%' }} />
        </div>
        <div className="progress-percentage">70%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/voting" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"/>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Final Rankings
        </h1>
      </div>

      <div className="instructions">
        Here are the final rankings for each category.
      </div>

      {['theme','venue','dates'].map(cat => (
        <div key={cat} className="category-section">
          <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
          <ol className="ranked-list">
            {getRanked(cat).map(({ option, score }, i) => (
              <li key={i} className={i===0 ? 'top-pick' : ''}>
                {displayLabel(option)} <span className="score-tag">({score} pts)</span>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <div className="next-button-row">
        {loading ? (
          <button className="next-button disabled" disabled>Loading...</button>
        ) : missingVoters.length === 0 ? (
          <Link to="/tasks"
                className="next-button active"
                style={{ backgroundColor: '#ffcf34', color: '#000' }}>
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled
                  style={{ backgroundColor: '#ccc', color: '#666' }}>
            Waiting on {missingVoters.join(', ')}
          </button>
        )}
      </div>
    </div>
  );
}

export default FinalResult;
