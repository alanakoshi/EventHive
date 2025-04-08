import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from './EventContext';
import './Voting.css';
import './App.css';

function Voting() {
    const { eventOptions, votes, setVotes } = useContext(EventContext);
    const [selected, setSelected] = useState({ theme: '', venue: '', budget: '', date: '' });
    const [showResults, setShowResults] = useState(false);

    // New state to keep track of user votes (replace with a more complex user ID tracking system if needed)
    const [userVotes, setUserVotes] = useState({});

    const handleVote = (category, option) => {
        // Check if the user has already voted in this category
        if (userVotes[category] === option) {
            return;  // Prevent voting again in the same category
        }

        // If there's an old vote, decrement the old option's count
        if (userVotes[category]) {
            setVotes((prevVotes) => ({
                ...prevVotes,
                [category]: {
                    ...prevVotes[category],
                    [userVotes[category]]: prevVotes[category][userVotes[category]] - 1
                }
            }));
        }

        // Set the user's new vote for the category
        setUserVotes((prevVotes) => ({
            ...prevVotes,
            [category]: option
        }));

        // Increment the new selected option's vote
        setVotes((prevVotes) => ({
            ...prevVotes,
            [category]: {
                ...prevVotes[category],
                [option]: (prevVotes[category][option] || 0) + 1
            }
        }));

        // Update the selected option for the category
        setSelected({ ...selected, [category]: option });
    };

    const calculatePercentage = (category, option) => {
        const totalVotes = Object.values(votes[category] || {}).reduce((a, b) => a + b, 0);
        return totalVotes ? ((votes[category][option] || 0) / totalVotes * 100).toFixed(1) : '0';
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    return (
        <div className="container">
            {/* Progress bar section */}
        <div className="progress-container">
            <div className="progress-bar" style={{ width: '70%' }} />
            <div className="progress-percentage">70%</div>
        </div>
            <div className='back-button'>
                <Link to="/budget" className="button-tile">&lt;</Link>
            </div>
            <h2>Voting</h2>
            {Object.keys(eventOptions).map((category) => (
                <div key={category}>
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    {eventOptions[category].map((option) => (
                        <label key={option}>
                            <input
                                type="radio"
                                name={category}
                                value={option}
                                checked={selected[category] === option}
                                onChange={() => handleVote(category, option)}
                            />
                            {option}
                            {showResults && (
                                <span> - {calculatePercentage(category, option)}%</span>
                            )}
                        </label>
                    ))}
                </div>
            ))}
            <button onClick={handleSubmit}>Submit Votes</button>
            {/* Next button */}
      <div className="next-button-row">
        <Link to="/final-result" className="next-button">
          Next
        </Link>
      </div>
        </div>
    );
}

export default Voting;
