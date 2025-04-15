import React, { useEffect, useState } from 'react';
import './Complete.css';
import { Link } from 'react-router-dom';
import { fetchEventByID } from './firebaseHelpers';

function Complete() {
  const [topDate, setTopDate] = useState('N/A');
  const [topTheme, setTopTheme] = useState('N/A');
  const [topVenue, setTopVenue] = useState('N/A');
  const [taskStatus, setTaskStatus] = useState('Loading...');

  useEffect(() => {
    const loadFinalData = async () => {
      const eventID = localStorage.getItem('eventID');
      const event = await fetchEventByID(eventID);
      if (!event) return;

      // Get top vote per category
      if (event?.votes) {
        const allVotes = event.votes;

        const getTop = (categoryKey) => {
          const scores = {};
          Object.values(allVotes).forEach(userVote => {
            const vote = userVote[categoryKey];
            if (vote) {
              for (const [option, score] of Object.entries(vote)) {
                scores[option] = (scores[option] || 0) + score;
              }
            }
          });
          const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
          return sorted.length > 0 ? sorted[0][0] : 'N/A';
        };

        setTopDate(getTop('dates'));
        setTopTheme(getTop('theme'));
        setTopVenue(getTop('venue'));
      }

      // Determine task status
      const tasks = event?.tasks || [];
      if (tasks.length === 0) {
        setTaskStatus('Finished');
      } else {
        const allCompleted = tasks.every(task => task.completed);
        setTaskStatus(allCompleted ? 'Finished' : 'In Progress');
      }
    };

    loadFinalData();
  }, []);

  return (
    <div className="complete-container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '100%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">100%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/tasks" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Complete</h1>
      </div>

      <div className="details">
        <p><strong>Date:</strong> {topDate}</p>
        <p><strong>Theme:</strong> {topTheme}</p>
        <p><strong>Venue:</strong> {topVenue}</p>
        <p><strong>Tasks:</strong> {taskStatus}</p>
      </div>

      <div className="next-button-row">
        <Link to="/home" className="next-button active" style={{ backgroundColor: '#ffcf34', color: '#000' }}>
          Home
        </Link>
      </div>
    </div>
  );
}

export default Complete;
