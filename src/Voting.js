import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';

function Voting() {
  const { eventOptions, setVotes } = useContext(EventContext);

  const [rankings, setRankings] = useState(() => {
    const initial = {};
    const initialVotes = {};
  
    for (const category in eventOptions) {
      const options = [...eventOptions[category]];
      initial[category] = options;
  
      // Pre-fill default scores (top-down)
      const scored = {};
      options.forEach((opt, idx) => {
        scored[opt] = options.length - idx;
      });
      initialVotes[category] = scored;
    }
  
    setVotes(initialVotes); // ✅ Pre-fill scores for all categories
  
    return initial;
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.droppableId !== result.destination.droppableId) return; // 🚫 block cross-category drops

    const category = result.source.droppableId;
    const items = Array.from(rankings[category]);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    setRankings((prev) => ({
        ...prev,
        [category]: items,
    }));

    const scoredVotes = {};
    items.forEach((item, index) => {
        scoredVotes[item] = items.length - index;
    });

    setVotes((prev) => ({
        ...prev,
        [category]: scoredVotes,
    }));
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
        <Link to="/budget" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Voting</h1>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.keys(eventOptions).map((category) => (
          <div key={category} className="category-section">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <Droppable droppableId={category} type={category}>
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
          <Link to="/final-result" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
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

export default Voting;
