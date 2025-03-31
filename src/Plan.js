import { Link } from 'react-router-dom';
import './Plan.css'
import './App.css'

function Plan() {
  return (
    <div>
      <div className='progress-bar'>Progress Bar</div>
      <div className='percentage'>10%</div>
      <div className='back-button'>
        <Link to="/" className="button-tile">&lt;</Link>
      </div>
      <h2>Plan</h2>
      <h3>Event Name</h3>
      <div className='color-block'>
        <div className='event-block'>
          <div className=''>Me & Hamster & John's Party</div>
        </div>
      </div>
      <div className="next-button">
        <Link to="/invite-cohost" className="button-tile">Next</Link>
      </div>
   </div>
  );
}

export default Plan;
