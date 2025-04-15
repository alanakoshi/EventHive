import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';
import { addVoteToFirestore } from './firebaseHelpers';
import { auth } from './firebase';

function Voting() {
  const { eventOptions, setVotes } = useContext(EventContext);
  const eventID = localStorage.getItem("eventID");

  const [rankings, setRankings] = useState(() => {
    const initial = {};
    for (const category in eventOptions) {
      initial[category] = [...eventOptions[category]];
    }
    return initial;
  });

  const [selected, setSelected] = useState({});
  const [userVotes, setUserVotes] = useState({});

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.droppableId !== result.destination.droppableId) return;

    const category = result.source.droppableId;
    const reordered = Array.from(rankings[category]);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    setRankings((prev) => ({
      ...prev,
      [category]: reordered,
    }));

    // Update scores locally (ranked top-down)
    const scores = {};
    reordered.forEach((item, index) => {
      scores[item] = reordered.length - index;
    });

    setVotes((prev) => ({
      ...prev,
      [category]: scores,
    }));
  };

  const handleClick = async (category, option) => {
    // Prevent re-voting the same option
    if (userVotes[category] === option) return;

    // Update Firestore with the single vote (not ranking)
    await addVoteToFirestore(eventID, auth.currentUser.uid, category, option);

    // Update UI state
    setUserVotes((prev) => ({ ...prev, [category]: option }));
    setSelected((prev) => ({ ...prev, [category]: option }));
  };

  const calculatePercentage = (category, option) => {
    if (selected[category]) {
      return selected[category] === option ? '100' : '0';
    }
    return '0';
  };

  const allCategoriesRanked = Object.keys(eventOptions).every(
    (category) => rankings[category] && rankings[category].length > 0
  );

  return (
    <div className="container">
      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '70%' }} />
        <div className="progress-percentage">70%</div>
      </div>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/budget" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Voting</h1>
      </div>

      {/* Voting UI */}
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
                  {rankings[category].map((option, index) => (
                    <Draggable key={option} draggableId={option} index={index}>
                      {(provided) => (
                        <div
                          className={`option-item ${selected[category] === option ? 'selected' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleClick(category, option)}
                        >
                          <span className="option-rank">{index + 1}.</span>
                          <span className="option-text">{option}</span>
                          {selected[category] && (
                            <span className="option-percentage"> - {calculatePercentage(category, option)}%</span>
                          )}
                          {selected[category] === option && (
                            <span className="checkmark">&#10003;</span>
                          )}
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

      {/* Next Button */}
      <div className="next-button-row">
        {allCategoriesRanked ? (
          <Link to="/final-result" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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

export default Voting;
