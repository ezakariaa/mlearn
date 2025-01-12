import React, { useState } from 'react';
import './styles/styles.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importation du hook useNavigate

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialisation de useNavigate

  const validateForm = () => {
    if (!email || !password) {
      setMessage('Please enter your email address and password.');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Appel au backend pour s'inscrire
      const response = await axios.post('http://localhost:5000/api/signup', {
        email,
        password,
        role,
      });

      // Afficher le message de succès
      setMessage(response.data); // "Successful Subscription."
    } catch (error) {
      const typedError = error as any;
      setMessage(typedError.response?.data || 'An unexpected error occurred.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Appel au backend pour se connecter
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
        role,
      });

      // Vérifier le rôle utilisateur
      const user = response.data.user;
      if (user.role !== role) {
        setMessage('Role does not match this email address.');
        return;
      }

      // Stocker l'ID du professeur connecté dans localStorage
      if (role === 'Professor') {
        localStorage.setItem('professorId', user.id.toString());
        navigate('/professor'); // Redirige vers la page Professor
      } else {
        navigate('/student'); // Redirige vers une page Student (si elle existe)
      }
    } catch (error) {
      const typedError = error as any;
      setMessage(typedError.response?.data || 'An unexpected error occurred.');
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

      {/* Formulaire centré */}
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
            {/* Message d'erreur ou de succès affiché ici */}
            {message && <p className="text-danger text-center mt-3">{message}</p>}
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-3">
        <div className="container text-center">
          <p>@Copyright: Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
