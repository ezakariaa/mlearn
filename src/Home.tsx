import React, { useState } from 'react';
import './styles/styles.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    if (!email || !password || !role) {
      setMessage('Please fill in all fields.');
      return false;
    }
    return true;
  };

  // Function to handle signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
        email,
        password,
        role,
      });

      setMessage(response.data.message || 'Signup successful!');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Signup error:', error.response?.data || error.message);
        setMessage(error.response?.data?.message || 'An unexpected error occurred during signup.');
      } else {
        console.error('Unexpected error:', error);
        setMessage('An unexpected error occurred during signup.');
      }
    }
  };

  // Function to handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
        role,
      });

      const token = response.data.token;
      const user = response.data.user;

      // Verify if the selected role matches the user's role
      if (user.role !== role) {
        setMessage('The selected role does not match the user.');
        return;
      }

      // Store token and email in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('email', user.email);

      // Navigate to the appropriate page based on the role
      if (role === 'Professor') {
        navigate('/professor');
      } else if (role === 'Student') {
        navigate('/student');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);
        setMessage(error.response?.data?.message || 'An unexpected error occurred during login.');
      } else {
        console.error('Unexpected error:', error);
        setMessage('No response from server. Please try again later.');
      }
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            MLEARN
          </a>
        </div>
      </nav>

      {/* Centered form */}
      <div className="home-form-container">
        <div className="card shadow p-4">
          <h1 className="text-center mb-4">Welcome to MLEARN</h1>
          <form>
            <div className="form-group mb-3">
              <label htmlFor="email">Email Address:</label>
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
            <div className="form-group mb-3">
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
            <div className="form-group select-group mb-3">
              <label htmlFor="profile">Profile:</label>
              <select
                className="form-control"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Student</option>
                <option>Professor</option>
              </select>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember the password
              </label>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={handleSignUp}
              >
                Sign up
              </button>
            </div>
            {/* Error or success message displayed here */}
            {message && <p className={`text-center mt-3 ${message.includes('error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-3">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
