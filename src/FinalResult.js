import { useContext } from 'react';
import { EventContext } from './EventContext';
import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function FinalResult() {
    const { votes } = useContext(EventContext);

    // Function to get the option with the highest votes for each category
    const getHighestVoteOption = (category) => {
        const categoryVotes = votes[category];

        // Check if categoryVotes exists and is an object
        if (categoryVotes && Object.keys(categoryVotes).length > 0) {
            const maxVotes = Math.max(...Object.values(categoryVotes));
            const highestOption = Object.keys(categoryVotes).find(
                (option) => categoryVotes[option] === maxVotes
            );
            return highestOption;
        } else {
            return "No votes yet"; // Default if no votes exist for the category
        }
    };

    return (
        <div className="container">
            {/* Progress bar section */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: '70%' }} />
                <div className="progress-percentage">70%</div>
            </div>
            <div className='back-button'>
                <Link to="/voting" className="button-tile">&lt;</Link>
            </div>
            <h2>Final Result</h2>

            {/* Display the highest votes for each category */}
            {['theme', 'venue', 'budget', 'dates'].map((category) => (
                <div key={category}>
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}:</h3>
                    <p>{getHighestVoteOption(category)}</p>
                </div>
            ))}

            {/* Next button */}
      <div className="next-button-row">
        <Link to="/tasks" className="next-button">
          Next
        </Link>
      </div>
        </div>
    );
}

export default FinalResult;
