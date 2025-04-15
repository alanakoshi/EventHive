import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';
import { auth } from './firebase';
import { fetchEventByID, updateEventInFirestore } from './firebaseHelpers';

function Voting() {
  const { eventOptions, setVotes } = useContext(EventContext);
  const eventID = localStorage.getItem('eventID');
  const userID = auth.currentUser?.uid;

  const [rankings, setRankings] = useState({});
  const [selected, setSelected] = useState({});

  // 🔄 Load previous votes for this user
  useEffect(() => {
    const loadPreviousVotes = async () => {
      const event = await fetchEventByID(eventID);
      if (event?.votes && event.votes[userID]) {
        const userVotes = event.votes[userID];
        const newRankings = {};

        for (const category of Object.keys(userVotes)) {
          const sortedOptions = Object.entries(userVotes[category])
            .sort((a, b) => b[1] - a[1])
            .map(([option]) => option);
          newRankings[category] = sortedOptions;
        }

        setRankings(newRankings);
        setVotes(event.votes[userID]);
      } else {
        const fresh = {};
        for (const category in eventOptions) {
          fresh[category] = [...eventOptions[category]];
        }
        setRankings(fresh);
      }
    };

    loadPreviousVotes();
  }, [eventID, userID, setVotes, eventOptions]);

  // 🧩 Handle drag reordering
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

    const updatedVotes = { ...rankings, [category]: reordered };
    setRankings(updatedVotes);
    setVotes((prev) => ({ ...prev, [category]: scores }));

    // 🔒 Save vote to Firestore per user
    const event = await fetchEventByID(eventID);
    const updatedAllVotes = { ...(event.votes || {}), [userID]: { ...(event.votes?.[userID] || {}), [category]: scores } };
    await updateEventInFirestore(eventID, { votes: updatedAllVotes });
  };

  const allCategoriesRanked = Object.keys(eventOptions).every(
    (category) => rankings[category] && rankings[category].length > 0
  );

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '70%' }} />
        <div className="progress-percentage">70%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/venue" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Voting</h1>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.keys(eventOptions).map((category) => (
          <div key={category} className="category-section">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <Droppable droppableId={category}>
              {(provided) => (
                <div
                  className="options-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
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
                          <span className="option-text">{option}</span>
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
          <button
            className="next-button disabled"
            disabled
            style={{ backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Voting;
