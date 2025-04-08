// src/components/auth/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // import useNavigate
import { auth } from '../../firebase'; // adjust the import path as needed

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // initialize the navigate hook

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in user:', userCredential.user);
      // Redirect user to the home page after successful login
      navigate('/home'); // adjust the route if needed
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
