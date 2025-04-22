import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './MenuSideBar.css';

function MenuSideBar({ isOpen, setIsOpen, userEmail, userInitial }) {
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName || user.email);
      } else {
        setDisplayName('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <>
      {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="profile-pic">
            {userInitial}
          </div>
          <p className="email">{userEmail || "Guest"}</p>
          <ul>
            <li>Privacy</li>
            <li>Security</li>
            <li>Information</li>
            <li className="logout" onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default MenuSideBar;