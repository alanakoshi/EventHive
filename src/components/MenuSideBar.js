import { useState } from 'react';
import './MenuSideBar.css';

function MenuSideBar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <img src="/profile.jpg" alt="Profile" className="profile-pic" />
          <p className="email">user@example.com</p>
          <ul>
            <li>Privacy</li>
            <li>Security</li>
            <li>Information</li>
            <li className="logout">Logout</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default MenuSideBar;
