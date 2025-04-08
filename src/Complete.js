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
            <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
            {/* Back button aligned left */}
            <Link to="/split-budget" className="btn back-btn rounded-circle shadow-sm back-icon">
              <i
                className="bi bi-arrow-left-short"
              ></i>
            </Link>

            {/* Centered title */}
            <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Complete</h1>
          </div>
            {/* Next button */}
      <div className="next-button-row">
        <Link to="/home" className="next-button">
          Next
        </Link>
      </div>
        </div>
    );
}

export default Voting;