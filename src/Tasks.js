import { Link } from 'react-router-dom';
import './Voting.css';
import './App.css';

function Tasks() {
    return (
        <div>
            <div className='progress-bar'>Progress Bar</div>
            <div className='percentage'>80%</div>
            <div className='back-button'>
                <Link to="/final-result" className="button-tile">&lt;</Link>
            </div>
            <h2>Tasks</h2>
            <div className="next-button">
                <Link to="/split-budget" className="button-tile">Next</Link>
            </div>
        </div>
    );
}

export default Tasks;