import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function Voting() {
    return (
        <div>
            <div className='progress-bar'>Progress Bar</div>
            <div className='percentage'>100%</div>
            <div className='back-button'>
                <Link to="/SplitBudget" className="button-tile">&lt;</Link>
            </div>
            <h2>Complete</h2>
            <div className="next-button">
                <Link to="/" className="button-tile">Home</Link>
            </div>
        </div>
    );
}

export default Voting;