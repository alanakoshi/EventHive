// src/Voting.js
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import { auth } from './firebase';
import { fetchEventByID, saveRankingVoteToFirestore } from './firebaseHelpers';
import './Voting.css';
import './App.css';

export default function Voting() {
  const { eventOptions, setEventOptions, setVotes } = useContext(EventContext);
  const eventID = localStorage.getItem('eventID');
  const userID = auth.currentUser?.uid;

  // Local state for your three ranking lists
  const [rankings, setRankings] = useState({
    theme:    [],
    venue:    [],
    dates:    [],  // ← we'll populate this with the intersection
  });

  // Hold the computed intersection of dates
  const [commonDates, setCommonDates] = useState([]);

  useEffect(() => {
    let interval;

    async function loadOptionsAndVotes() {
      const event = await fetchEventByID(eventID);
      if (!event) return;

      // 1. basic theme & venue arrays
      const theme = event.theme || [];
      const venue = event.venue || [];

      // 2. compute intersection of event.dates (which is an object { email: [isoDates], … })
      let intersects = [];
      const rawDates = event.dates;
      if (rawDates && typeof rawDates === 'object' && !Array.isArray(rawDates)) {
        const allArrays = Object.values(rawDates).filter(arr => Array.isArray(arr));
        if (allArrays.length) {
          intersects = allArrays.reduce((acc, arr) =>
            acc.filter(d => arr.includes(d)),
            allArrays[0].slice()
          );
        }
      } else if (Array.isArray(rawDates)) {
        // legacy fallback
        intersects = rawDates.slice();
      }
      setCommonDates(intersects);

      // 3. update context for theme & venue (leave eventOptions.dates alone)
      setEventOptions({ theme, venue, dates: eventOptions.dates });

      // 4. load or initialize this user's votes & rankings
      const userVotes = event.votes?.[userID] || {};
      const newRank = {};
      const newVotesMap = {};

      const categories = { theme, venue, dates: intersects };
      for (const cat of ['theme','venue','dates']) {
        const opts = categories[cat];
        if (userVotes[cat]) {
          // merge saved order + any brand-new options
          const prevOrder = Object.entries(userVotes[cat])
            .sort((a,b) => b[1] - a[1])
            .map(([opt]) => opt);
          const merged = Array.from(new Set([...prevOrder, ...opts]));
          newRank[cat] = merged;

          // rebuild scores
          const scores = {};
          merged.forEach((o,i) => scores[o] = merged.length - i);
          newVotesMap[cat] = scores;
        } else {
          // first-time default: use opts order
          newRank[cat] = opts.slice();
          const scores = {};
          opts.forEach((o,i) => scores[o] = opts.length - i);
          newVotesMap[cat] = scores;
          // save them immediately
          await saveRankingVoteToFirestore(eventID, userID, cat, scores);
        }
      }

      setRankings(newRank);
      setVotes(newVotesMap);
    }

    loadOptionsAndVotes();
    interval = setInterval(loadOptionsAndVotes, 1000);
    return () => clearInterval(interval);
  }, [eventID, userID, eventOptions.dates, setEventOptions, setVotes]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const cat   = result.source.droppableId;
    const list  = Array.from(rankings[cat]);
    const [m]   = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, m);

    const scores = {};
    list.forEach((opt,i) => scores[opt] = list.length - i);

    setRankings(r => ({ ...r, [cat]: list }));
    setVotes     (v => ({ ...v, [cat]: scores }));
    await saveRankingVoteToFirestore(eventID, userID, cat, scores);
  };

  const allRanked = ['theme','venue','dates']
    .every(cat => rankings[cat]?.length > 0);

  return (
    <div className="container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '60%' }} />
        </div>
        <div className="progress-percentage">60%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/venue" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short" />
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Voting</h1>
      </div>

      <div className='instructions'>
        Rank each category by dragging options in your preferred order.
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {['theme','venue','dates'].map(cat => (
          <div key={cat} className="category-section">
            <h3>{cat[0].toUpperCase()+cat.slice(1)}</h3>
            <Droppable droppableId={cat}>
              {provided => (
                <div
                  className="options-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {(cat==='dates' ? commonDates : eventOptions[cat]).map((opt, idx) => {
                    const id = typeof opt==='string' ? opt : JSON.stringify(opt);
                    return (
                      <Draggable key={id} draggableId={id} index={idx}>
                        {inner => (
                          <div
                            className="option-item"
                            ref={inner.innerRef}
                            {...inner.draggableProps}
                            {...inner.dragHandleProps}
                          >
                            <span className="option-rank">{idx+1}.</span>
                            <span className="option-text">{opt}</span>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>

      <div className="next-button-row">
        {allRanked
          ? <Link to="/final-result" className="next-button active">
              Next
            </Link>
          : <button className="next-button disabled" disabled>Next</button>
        }
      </div>
    </div>
  );
}
