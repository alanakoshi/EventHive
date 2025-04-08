import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';

function Voting() {
    const { eventOptions, votes, setVotes } = useContext(EventContext);
    const [selected, setSelected] = useState({ theme: '', venue: '', budget: '', date: '' });
    // New state to track which option each user has voted for in each category
    const [userVotes, setUserVotes] = useState({});

    const handleVote = (category, option) => {
        // Prevent voting twice for the same option in this category
        if (userVotes[category] === option) {
            return;
        }
        
        // Update votes in one state update for this category
        setVotes((prevVotes) => {
            // Get current votes for the category (or an empty object if none)
            const currentVotes = { ...(prevVotes[category] || {}) };

            // If there was a previous vote by this user in this category, decrement its count (ensuring it doesn’t go below 0)
            if (userVotes[category]) {
                currentVotes[userVotes[category]] = Math.max((currentVotes[userVotes[category]] || 0) - 1, 0);
            }

            // Increment the selected option's vote count
            currentVotes[option] = (currentVotes[option] || 0) + 1;

            return {
                ...prevVotes,
                [category]: currentVotes
            };
        });

        // Update userVotes and selected for the category
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
            {/* Progress bar section */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: '70%' }} />
                <div className="progress-percentage">70%</div>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
                {/* Back button aligned left */}
                <Link to="/budget" className="btn back-btn rounded-circle shadow-sm back-icon">
                    <i className="bi bi-arrow-left-short"></i>
                </Link>
                {/* Centered title */}
                <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Voting</h1>
            </div>
            {Object.keys(eventOptions).map((category) => (
                <div key={category} className="category-section">
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div className="options-list">
                        {eventOptions[category].map((option) => (
                            <div
                                key={option}
                                className={`option-item ${selected[category] === option ? 'selected' : ''}`}
                                onClick={() => handleVote(category, option)}
                            >
                                <span className="option-text">{option}</span>
                                {selected[category] && (
                                    <span className="option-percentage"> - {calculatePercentage(category, option)}%</span>
                                )}
                                {selected[category] === option && (
                                    <span className="checkmark">&#10003;</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {/* Next button */}
            <div className="next-button-row">
                {allCategoriesVoted ? (
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
