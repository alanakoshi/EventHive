import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function FinalResult() {
    return (
        <div>
            <div className='progress-bar'>Progress Bar</div>
            <div className='percentage'>70%</div>
            <div className='back-button'>
                <Link to="/voting" className="button-tile">&lt;</Link>
            </div>
            <h2>Final Result</h2>
            <div className="next-button">
                <Link to="/tasks" className="button-tile">Next</Link>
            </div>
        </div>
    );
}

export default FinalResult;