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

  // Local state for rankings
  const [rankings, setRankings] = useState({
    theme: [], venue: [], dates: [],
  });
  const [commonDates, setCommonDates] = useState([]);

  useEffect(() => {
    let interval;
    async function loadOptionsAndVotes() {
      const event = await fetchEventByID(eventID);
      if (!event) return;

      const theme = event.theme || [];
      const venue = event.venue || [];

      // compute intersection of dates
      let intersects = [];
      const rawDates = event.dates;
      if (rawDates && typeof rawDates === 'object' && !Array.isArray(rawDates)) {
        const allArrays = Object.values(rawDates).filter(Array.isArray);
        if (allArrays.length) {
          intersects = allArrays.reduce((acc, arr) =>
            acc.filter(d => arr.includes(d)),
            allArrays[0].slice()
          );
        }
      } else if (Array.isArray(rawDates)) {
        intersects = rawDates.slice();
      }
      setCommonDates(intersects);

      // update context
      setEventOptions({ theme, venue, dates: eventOptions.dates });

      // load or init votes
      const userVotes = event.votes?.[userID] || {};
      const newRank = {};
      const newVotesMap = {};
      const categories = { theme, venue, dates: intersects };

      for (const cat of ['theme','venue','dates']) {
        const opts = categories[cat];
        if (userVotes[cat]) {
          const prevOrder = Object.entries(userVotes[cat])
            .sort((a,b) => b[1] - a[1])
            .map(([opt]) => opt);
          const merged = Array.from(new Set([...prevOrder, ...opts]));
          newRank[cat] = merged;
          const scores = {};
          merged.forEach((o,i) => scores[o] = merged.length - i);
          newVotesMap[cat] = scores;
        } else {
          newRank[cat] = opts.slice();
          const scores = {};
          opts.forEach((o,i) => scores[o] = opts.length - i);
          newVotesMap[cat] = scores;
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
    const cat  = result.source.droppableId;
    const list = Array.from(rankings[cat]);
    const [m]  = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, m);

    const scores = {};
    list.forEach((opt,i) => scores[opt] = list.length - i);

    setRankings(r => ({ ...r, [cat]: list }));
    setVotes(v => ({ ...v, [cat]: scores }));
    await saveRankingVoteToFirestore(eventID, userID, cat, scores);
  };

  const allRanked = ['theme','venue','dates']
    .every(cat => rankings[cat]?.length > 0);

  return (
    <div className="container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '66%' }} />
        </div>
        <div className="progress-percentage">66%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/venue" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short" />
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Voting
        </h1>
      </div>

      <div className='instructions'>
        Rank each category by dragging options in your preferred order.
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {['theme','venue','dates'].map(cat => (
          <div key={cat} className="category-section">
            <h3 className="category-title">
              {cat[0].toUpperCase() + cat.slice(1)}
            </h3>
            <Droppable droppableId={cat}>
              {(provided) => (
                <div
                  className="options-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {rankings[cat].map((opt, idx) => (
                    <Draggable key={opt} draggableId={opt} index={idx}>
                      {(draggableProvided) => (
                        <div
                          className="option-item"
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          <span className="option-rank">{idx+1}.</span>
                          <span className="option-text">{opt}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
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
