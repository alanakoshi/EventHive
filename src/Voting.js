import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';
import { auth } from './firebase';
import { fetchEventByID, saveRankingVoteToFirestore } from './firebaseHelpers';

function Voting() {
  const { eventOptions, setEventOptions, setVotes } = useContext(EventContext);
  const eventID = localStorage.getItem('eventID');
  const userID = auth.currentUser?.uid;

  const [rankings, setRankings] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const loadOptionsAndVotes = async (compareOnly = false) => {
    const eventData = await fetchEventByID(eventID);
    if (!eventData) return;

    const newOptions = {
      theme: eventData.theme || [],
      venue: eventData.venue || [],
      dates: eventData.dates || [],
    };

    // Check if new options have been added
    if (compareOnly) {
      let newAdded = false;
      for (const category of ['theme', 'venue', 'dates']) {
        const currentSet = new Set(eventOptions[category]?.map(opt => JSON.stringify(opt)));
        const latestSet = new Set(newOptions[category]?.map(opt => JSON.stringify(opt)));
        if (latestSet.size > currentSet.size) {
          for (const item of latestSet) {
            if (!currentSet.has(item)) {
              newAdded = true;
              break;
            }
          }
        }
      }
      if (newAdded) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    }

    setEventOptions(newOptions);

    const userVotes = eventData.votes?.[userID] || {};
    const newRankings = {};
    const newVotes = {};

    for (const category of ['theme', 'venue', 'dates']) {
      const currentOptions = eventData[category] || [];

      if (userVotes[category]) {
        const sorted = Object.entries(userVotes[category])
          .sort((a, b) => b[1] - a[1])
          .map(([option]) => option);

        const merged = [...new Set([...sorted, ...currentOptions])];
        newRankings[category] = merged;

        const scores = {};
        merged.forEach((opt, i) => (scores[opt] = merged.length - i));
        newVotes[category] = scores;
      } else {
        newRankings[category] = [...currentOptions];
        const scores = {};
        currentOptions.forEach((opt, i) => (scores[opt] = currentOptions.length - i));
        newVotes[category] = scores;

        await saveRankingVoteToFirestore(eventID, userID, category, scores);
      }
    }

    setRankings(newRankings);
    setVotes(newVotes);
  };

  useEffect(() => {
    loadOptionsAndVotes();

    const interval = setInterval(() => loadOptionsAndVotes(true), 1000);
    return () => clearInterval(interval);
  }, [eventID, userID]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const category = result.source.droppableId;
    const reordered = Array.from(rankings[category]);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    const scores = {};
    reordered.forEach((item, index) => {
      scores[item] = reordered.length - index;
    });

    setRankings((prev) => ({ ...prev, [category]: reordered }));
    setVotes((prev) => ({ ...prev, [category]: scores }));

    await saveRankingVoteToFirestore(eventID, userID, category, scores);
  };

  const allCategoriesRanked = ['theme', 'venue', 'dates'].every(
    (category) => rankings[category] && rankings[category].length > 0
  );

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '70%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">70%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/venue" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Voting</h1>
      </div>

      {showPopup && (
        <div className="popup-banner">
          A new option has been added!
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        {['theme', 'venue', 'dates'].map((category) => (
          <div key={category} className="category-section">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <Droppable droppableId={category}>
              {(provided) => (
                <div className="options-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {(rankings[category] || []).map((option, index) => (
                    <Draggable key={option} draggableId={option} index={index}>
                      {(provided) => (
                        <div
                          className="option-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <span className="option-rank">{index + 1}.</span>
                          <span className="option-text">
                            {typeof option === 'string' ? option : option.name || JSON.stringify(option)}
                          </span>
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
        {allCategoriesRanked ? (
          <Link
            to="/final-result"
            className="next-button active"
            style={{ backgroundColor: '#ffcf34', color: '#000' }}
          >
            Next
          </Link>
        ) : (
          <button className="next-button disabled" disabled>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Voting;
