// FinalResult.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchEventByID,
  fetchUserNameByUID
} from './firebaseHelpers';
import './Voting.css';
import './App.css';

function FinalResult() {
  const [eventOptions, setEventOptions]   = useState({ theme: [], venue: [], dates: [] });
  const [finalVotes, setFinalVotes]       = useState({});
  const [missingVoters, setMissingVoters] = useState([]);
  const [loading, setLoading]             = useState(true);

  const displayLabel = (opt) => {
    if (typeof opt === 'string') return opt;
    if (opt?.name)                return opt.name;
    if (opt?.email)               return opt.email;
    return 'Unknown';
  };

  const getAllOptionsInCategory = (cat) => {
    const fromEvent = eventOptions[cat] || [];
    const fromVotes = Object.values(finalVotes)
      .flatMap(v => Object.keys(v?.[cat] || {}))
      .map(raw => {
        try { return JSON.parse(raw); }
        catch { return raw; }
      });
    const seen = new Set();
    return [...fromEvent, ...fromVotes].filter(o => {
      const key = typeof o === 'string' ? o : JSON.stringify(o);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

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

      // normalize event arrays
      const theme = Array.isArray(ev.theme) ? ev.theme : [];
      const venue = Array.isArray(ev.venue) ? ev.venue : [];

      // intersect dates if object, else use array
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

      // build participant names: host + cohost names
      const participants = [];
      const hostName = await fetchUserNameByUID(ev.hostID) || 'Host';
      participants.push(hostName);
      (ev.cohosts || []).forEach(c => {
        participants.push(c.name);
      });

      // who has voted? map vote UIDs to names
      const voteUIDs = Object.keys(ev.votes || {});
      const votedNames = await Promise.all(
        voteUIDs.map(uid => fetchUserNameByUID(uid))
      );

      // missing = participants minus those in votedNames
      const missing = participants.filter(p => !votedNames.includes(p));
      setMissingVoters(missing);
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
          <div className="progress-bar" style={{ width: '77%' }} />
        </div>
        <div className="progress-percentage">77%</div>
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

      {/* Waiting banner */}
      {!loading && missingVoters.length > 0 && (
        <div className="alert-popup">
          Waiting on: {missingVoters.join(', ')} to vote.
        </div>
      )}

      {/* Rankings */}
      {['theme','venue','dates'].map(cat => (
        <div key={cat} className="category-section">
          <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
          <div className="options-list">
            {getRanked(cat).map(({ option, score }, i) => {
              const id = typeof option === 'string' ? option : JSON.stringify(option);
              return (
                <div
                  key={id}
                  className={`option-item${i === 0 ? ' top-pick' : ''}`}
                >
                  <span className="option-rank">{i+1}.</span>{' '}
                  <span className="option-text">{displayLabel(option)}</span>{' '}
                  <span className="score-tag">({score} pts)</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="next-button-row">
        {loading ? (
          <button className="next-button disabled" disabled>
            Loading...
          </button>
        ) : missingVoters.length === 0 ? (
          <Link to="/tasks" className="next-button active">
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled>
            Waiting on {missingVoters.join(', ')}
          </button>
        )}
      </div>
    </div>
  );
}

export default FinalResult;
