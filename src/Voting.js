import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';
import { addVoteToFirestore } from './firebaseHelpers';
import { auth } from './firebase';

function Voting() {
    const { eventOptions, votes, setVotes } = useContext(EventContext);
    const [selected, setSelected] = useState({ theme: '', venue: '', budget: '', date: '' });
    // New state to track which option each user has voted for in each category
    const [userVotes, setUserVotes] = useState({});
    const eventID = localStorage.getItem("eventID");

    const handleVote = async (category, option) => {
        // Prevent voting twice for the same option in this category
        if (userVotes[category] === option) {
            return;
        }
        
        // Update votes in Firestore
        await addVoteToFirestore(eventID, auth.currentUser.uid, category, option);
        
        // Update local state (EventContext)
        setVotes((prevVotes) => {
            const currentVotes = { ...(prevVotes[category] || {}) };
        
            if (userVotes[category]) {
            currentVotes[userVotes[category]] = Math.max((currentVotes[userVotes[category]] || 0) - 1, 0);
            }
        
            currentVotes[option] = (currentVotes[option] || 0) + 1;
        
            return {
            ...prevVotes,
            [category]: currentVotes
            };
      });
    
      // Update which option the user voted for in local state
      setUserVotes((prev) => ({ ...prev, [category]: option }));
      setSelected((prev) => ({ ...prev, [category]: option }));
    };

    // Update calculatePercentage so that once an option is selected in a category,
    // the selected option shows 100% and all other options show 0%
    const calculatePercentage = (category, option) => {
        if (selected[category]) {
            return selected[category] === option ? '100' : '0';
        }
        return '0';
    };

    const allCategoriesVoted = Object.keys(eventOptions).every(
        (category) => userVotes[category]
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
