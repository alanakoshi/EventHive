// Complete.js
import React, { useState, useEffect } from 'react';
import './Complete.css';
import { Link } from 'react-router-dom';
import { fetchEventByID } from './firebaseHelpers';

function Complete() {
  const [topDate, setTopDate]       = useState('N/A');
  const [topTheme, setTopTheme]     = useState('N/A');
  const [topVenue, setTopVenue]     = useState('N/A');
  const [taskStatus, setTaskStatus] = useState('Loading...');
  const [votesCache, setVotesCache] = useState(null);

  const displayLabel = (opt) => {
    if (typeof opt === 'string') return opt;
    if (opt?.name)                return opt.name;
    if (opt?.email)               return opt.email;
    return String(opt);
  };

  // Flatten event[cat] into an array, whether it's an array or object-of-arrays
  const getEventOrder = (cat, event) => {
    const raw = event[cat];
    if (Array.isArray(raw)) {
      return raw;
    } else if (raw && typeof raw === 'object') {
      return Object.values(raw).flat();
    }
    return [];
  };

  // Gather all options and produce a unique list preserving event order first, then vote order
  const getAllOptionsInCategory = (cat, event) => {
    const eventOrder = getEventOrder(cat, event);
    const fromVotes = Object.values(event.votes || {})
      .flatMap(u => Object.keys(u[cat] || {}))
      .map(raw => {
        try { return JSON.parse(raw); }
        catch { return raw; }
      });

    const seen = new Set();
    // eventOrder first
    eventOrder.forEach(o => {
      const k = typeof o === 'string' ? o : JSON.stringify(o);
      seen.add(k);
    });

    // build combined array
    const combined = [...eventOrder];
    fromVotes.forEach(o => {
      const k = typeof o === 'string' ? o : JSON.stringify(o);
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(o);
      }
    });

    return combined;
  };

  // Rank them: by score desc, then by original event order
  const getRanked = (cat, event) => {
    const opts = getAllOptionsInCategory(cat, event);
    const scores = {};

    Object.values(event.votes || {}).forEach(u => {
      const ballots = u[cat] || {};
      opts.forEach(o => {
        const key = typeof o === 'string' ? o : JSON.stringify(o);
        scores[key] = (scores[key] || 0) + (ballots[key] || 0);
      });
    });

    return opts
      .map(o => {
        const key = typeof o === 'string' ? o : JSON.stringify(o);
        return { option: o, score: scores[key] || 0 };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // tie-breaker: original event order index
        const idxA = opts.findIndex(x =>
          (typeof x==='string' ? x : JSON.stringify(x)) ===
          (typeof a.option==='string' ? a.option : JSON.stringify(a.option))
        );
        const idxB = opts.findIndex(x =>
          (typeof x==='string' ? x : JSON.stringify(x)) ===
          (typeof b.option==='string' ? b.option : JSON.stringify(b.option))
        );
        return idxA - idxB;
      });
  };

  useEffect(() => {
    const iv = setInterval(loadFinalData, 1000);
    return () => clearInterval(iv);
  }, [votesCache]);

  async function loadFinalData() {
    const eventID = localStorage.getItem('eventID');
    if (!eventID) return;
    const event = await fetchEventByID(eventID);
    if (!event) return;

    const votesString = JSON.stringify(event.votes || {});
    if (votesString !== votesCache) {
      setVotesCache(votesString);

      // Date
      const rd = getRanked('dates', event);
      setTopDate(
        rd.length > 0 ? displayLabel(rd[0].option) : 'N/A'
      );

      // Theme
      const rt = getRanked('theme', event);
      setTopTheme(
        rt.length > 0 ? displayLabel(rt[0].option) : 'N/A'
      );

      // Venue
      const rv = getRanked('venue', event);
      setTopVenue(
        rv.length > 0 ? displayLabel(rv[0].option) : 'N/A'
      );
    }

    // Tasks status
    const tasks = event.tasks || [];
    const allDone = tasks.length === 0 || tasks.every(t => t.completed);
    setTaskStatus(allDone ? 'Finished' : 'In Progress');
  }

  return (
    <div className="complete-container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '100%' }} />
        </div>
        <div className="progress-percentage">100%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/tasks" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Complete
        </h1>
      </div>

      <div className="instructions">
        Final selections are shown below. Tasks will update as they're completed.
      </div>

      <div className="details">
        <p><strong>Date:</strong>  {topDate}</p>
        <p><strong>Theme:</strong> {topTheme}</p>
        <p><strong>Venue:</strong> {topVenue}</p>
        <p><strong>Tasks:</strong> {taskStatus}</p>
      </div>

      <div className="next-button-row">
        <Link to="/home" className="next-button active">
          Home
        </Link>
      </div>
    </div>
  );
}

export default Complete;
