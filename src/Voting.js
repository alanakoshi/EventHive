import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';
import { auth } from './firebase';
import { fetchEventByID, saveRankingVoteToFirestore } from './firebaseHelpers';

function Voting() {
  const { eventOptions, setVotes } = useContext(EventContext);
  const eventID = localStorage.getItem('eventID');
  const userID = auth.currentUser?.uid;

  const [rankings, setRankings] = useState({});
  
  // Load previous votes if they exist
  useEffect(() => {
    const loadVotes = async () => {
      const eventData = await fetchEventByID(eventID);
      if (eventData?.votes && eventData.votes[userID]) {
        const userVotes = eventData.votes[userID];
        const loadedRankings = {};

        for (const category of Object.keys(userVotes)) {
          const sortedOptions = Object.entries(userVotes[category])
            .sort((a, b) => b[1] - a[1])
            .map(([option]) => option);
          loadedRankings[category] = sortedOptions;
        }

        setRankings(loadedRankings);
        setVotes(userVotes);
      } else {
        const freshRankings = {};
        for (const category in eventOptions) {
          freshRankings[category] = [...eventOptions[category]];
        }
        setRankings(freshRankings);
      }
    };

    loadVotes();
  }, [eventID, userID, eventOptions, setVotes]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const category = result.source.droppableId;
    const reordered = Array.from(rankings[category]);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    // Calculate scores
    const scores = {};
    reordered.forEach((item, index) => {
      scores[item] = reordered.length - index;
    });

    setRankings((prev) => ({
      ...prev,
      [category]: reordered,
    }));

    setVotes((prev) => ({
      ...prev,
      [category]: scores,
    }));

    // Save to Firestore
    await saveRankingVoteToFirestore(eventID, userID, category, scores);
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
          <button className="next-button disabled" disabled>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default Voting;
