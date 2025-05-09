import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './SignUp.css';
import { addUserToFirestore } from '../../firebaseHelpers';

function SignUp() {
  const [name, setName] = useState('');    // Full Name input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Add display name to Auth profile
      await updateProfile(userCredential.user, { displayName: name });

      // Add user to Firestore 'users' collection
      await addUserToFirestore(userCredential.user.uid, name, email);

      console.log('User registered:', userCredential.user);

      navigate('/home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else {
        setError(error.message);
      }
      console.error('Signup error:', error);
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
            className="form-control ps-3"
            placeholder="Name"
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

        <button type="submit" className="btn btn-dark w-100 text-white">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
