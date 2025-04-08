import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './MenuSideBar.css';

function MenuSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        // Set userName to the display name, or if not provided, use the first letter of email
        setUserName(user.displayName || user.email.charAt(0).toUpperCase());
      } else {
        setUserEmail('');
        setUserName('');
      }
    });
    // Cleanup the subscription on unmount.
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // After successful sign out, navigate to the login/signup page.
        navigate('/');
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <>
      <div className="hamburger" onClick={() => setIsOpen(true)}>
        ☰
      </div>

      {/* Dimming background */}
      {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

      {/* Sidebar menu */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Instead of an <img>, show a circle with the first letter of the user's name */}
          <div className="profile-pic">
            {userName ? userName.charAt(0).toUpperCase() : "G"}
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
