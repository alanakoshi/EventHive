// src/components/auth/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // import useNavigate
import { auth, db } from '../../firebase'; // adjust the import path as needed
import { addUserToFirestore } from '../../firebaseHelpers';
import { getDoc, doc } from 'firebase/firestore';
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
  
      const user = userCredential.user;
  
      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        // Add to Firestore if missing
        await addUserToFirestore(user.uid, user.displayName || "", user.email);
      }
  
      navigate('/home');
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
        <button type="submit" className="btn btn-dark w-100 text-white">
          Log In
        </button>
    </form>
  </div>
  );
}

export default Login;
