import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

function AuthPage() {
  // State to toggle between Login and SignUp components.
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2>Welcome to Cohosting App</h2>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowLogin(true)} style={{ marginRight: "10px" }}>
          Login
        </button>
        <button onClick={() => setShowLogin(false)}>
          Sign Up
        </button>
      </div>

      {/* Render the Login or SignUp component based on state */}
      {showLogin ? <Login /> : <SignUp />}
    </div>
  );
}

export default AuthPage;
