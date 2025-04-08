import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function Voting() {
    return (
        <div className="container">
            {/* Progress bar section */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: '100%' }} />
                <div className="progress-percentage">100%</div>
            </div>
            <div className='back-button'>
                <Link to="/split-budget" className="button-tile">&lt;</Link>
            </div>
            <h2>Complete</h2>
            <div className="next-button">
                <Link to="/" className="button-tile">Home</Link>
            </div>
        </div>
    );
}

export default Voting;