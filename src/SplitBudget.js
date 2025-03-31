import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function SplitBudget() {
    return (
        <div>
            <div className='progress-bar'>Progress Bar</div>
            <div className='percentage'>90%</div>
            <div className='back-button'>
                <Link to="/tasks" className="button-tile">&lt;</Link>
            </div>
            <h2>Split Budget</h2>
            <div className="next-button">
                <Link to="/complete" className="button-tile">Next</Link>
            </div>
        </div>
    );
}

export default SplitBudget;