// src/components/auth/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // import useNavigate
import { auth } from '../../firebase'; // adjust the import path as needed
import './Login.css';

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
  <div className="container mt-5" style={{ maxWidth: '400px' }}>
    <h2 className="mb-4 text-center">Log In</h2>
    {error && <p className="text-danger">{error}</p>}
    
    <form onSubmit={handleLogin}>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required />
      </div>
        <button type="submit" className="btn btn-gold w-100 text-white">
          Log In
        </button>
    </form>
  </div>
  );
}

export default Login;
