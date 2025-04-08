import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import './AuthPage.css';

function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="auth-container">
      <h2 className="auth-title">Welcome to EventHive</h2>

      <div className="auth-toggle">
        <button
          className={`auth-tab ${showLogin ? 'active' : ''}`}
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
        <button
          className={`auth-tab ${!showLogin ? 'active' : ''}`}
          onClick={() => setShowLogin(false)}
        >
          Sign Up
        </button>
      </div>

      <div className="auth-form-wrapper">
        {showLogin ? <Login /> : <SignUp />}
      </div>
    </div>
  );
}

export default AuthPage;
