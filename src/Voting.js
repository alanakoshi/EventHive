import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function Voting() {
    return (
        <div>
            <div className='progress-bar'>Progress Bar</div>
            <div className='percentage'>70%</div>
            <div className='back-button'>
                <Link to="/budget" className="button-tile">&lt;</Link>
            </div>
            <h2>Voting</h2>
            <div className="next-button">
                <Link to="/final-result" className="button-tile">Next</Link>
            </div>
        </div>
    );
}

export default Voting;