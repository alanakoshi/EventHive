import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { fetchCohostsForEvent } from './firebaseHelpers';
import './App.css';

const REQUIRED_CATEGORIES = ['theme', 'venue', 'dates'];

function Wait() {
  const [allReady, setAllReady] = useState(false);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const eventID = localStorage.getItem('eventID');
    const userEmail = auth.currentUser?.email;

    if (!eventID || !userEmail) return;

    const eventRef = doc(db, 'events', eventID);

    // Mark user as present
    const markWaiting = async () => {
      await updateDoc(eventRef, {
        [`waitingUsers.${userEmail}`]: true,
      });
    };

    // Unmark on tab close/leave
    const unmarkWaiting = async () => {
      await updateDoc(eventRef, {
        [`waitingUsers.${userEmail}`]: false,
      });
    };

    markWaiting();
    window.addEventListener('beforeunload', unmarkWaiting);

    const unsubscribe = onSnapshot(eventRef, async (snapshot) => {
      const event = snapshot.data();
      if (!event) return;

      setEventName(event.name || 'Your Event');

      const cohosts = await fetchCohostsForEvent(eventID);
      const allUsers = [...cohosts.map(c => c.email), event.creatorEmail];
      const suggestions = event.suggestionsByUser || {};
      const waiting = event.waitingUsers || {};

      const everyoneSubmitted = allUsers.every(email =>
        suggestions[email] &&
        REQUIRED_CATEGORIES.every(cat =>
          Array.isArray(suggestions[email][cat]) && suggestions[email][cat].length > 0
        )
      );

      const everyoneHere = allUsers.every(email => waiting[email]);

      setAllReady(everyoneSubmitted && everyoneHere);
      setLoading(false);
    });

    return () => {
      unmarkWaiting();
      window.removeEventListener('beforeunload', unmarkWaiting);
      unsubscribe();
    };
  }, []);

  const handleContinue = () => {
    navigate('/voting');
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '60%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">60%</div>
      </div>

      <h1 className="text-center my-4">{eventName} – Waiting Room</h1>

      {loading ? (
        <p className="text-center">Checking status...</p>
      ) : allReady ? (
        <div className="text-center">
          <p>All suggestions submitted. Everyone is present.</p>
          <button
            className="next-button active mt-3"
            onClick={handleContinue}
            style={{ backgroundColor: '#ffcf34', color: '#000' }}
          >
            Continue to Voting
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p>Waiting for everyone to finish suggestions and open this page...</p>
          <div className="spinner-border text-warning mt-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wait;
