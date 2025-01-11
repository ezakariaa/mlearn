import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/styles.css'; // Unique fichier CSS pour éviter les conflits
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState('Student');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage('Please enter an email address and password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      const { user } = response.data;

      if (remember) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      if (user.role === 'Student' && profile === 'Student') {
        navigate('/students');
      } else if (user.role === 'Professor' && profile === 'Professor') {
        navigate('/teachers');
      } else {
        setMessage('The selected role does not match your account.');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Connexion Error.');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage('Please enter an email address and password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', {
        email,
        password,
        role: profile,
      });
      setMessage(response.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error while registering.');
    }
  };

  return (
    <div className="home-container">
  <div className="home-form">
    <h1 className="home-title">Welcome to MLEARN</h1>
    <form>
      <div className="form-group">
        <label htmlFor="email">Email Adress:</label>
        <div className="input-with-icon">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <div className="input-with-icon">
          <FaLock className="input-icon" />
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="profile">Profil:</label>
        <select
          className="form-control"
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        >
          <option>Student</option>
          <option>Professor</option>
        </select>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="remember">
          Remember the password
        </label>
      </div>
      <div className="d-flex gap-3 mt-3">
        <button onClick={handleLogin} className="btn btn-primary">
          Login
        </button>
        <button onClick={handleSubscribe} className="btn btn-secondary">
          Sign up
        </button>
      </div>
    </form>
    {message && <p className="text-danger">{message}</p>}
  </div>
</div>

  );
};

export default Home;
