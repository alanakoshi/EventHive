import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './SignUp.css';

function SignUp() {
  const [name, setName] = useState('');    // Full Name input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with the entered name
      await updateProfile(userCredential.user, { displayName: name });
      
      console.log('User registered:', userCredential.user);
      navigate('/home');  // Redirect to home (or your desired route)
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError(error.message);
      }
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Sign Up</h2>
      {error && <p className="text-danger">{error}</p>}
      
      <form onSubmit={handleSignUp}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-brown w-100 text-white">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
