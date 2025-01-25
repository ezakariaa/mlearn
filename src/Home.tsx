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
  const [isError, setIsError] = useState(false); // Suivi si le message est une erreur
  const navigate = useNavigate();

  // Fonction de validation du formulaire
  const validateForm = () => {
    if (!email || !password || !role) {
      setMessage('Please enter your email, password, and select a role.');
      setIsError(true); // Définit le message comme une erreur
      return false;
    }
    return true;
  };

  // Fonction pour gérer la connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
        role,
      });

      const user = response.data.user;

      // Vérifiez si le rôle sélectionné correspond au rôle de l'utilisateur
      if (user.role !== role) {
        setMessage('Choose the correct role.');
        setIsError(true);
        return;
      }

      // Stocke les informations utilisateur dans le localStorage
      localStorage.setItem('userId', user.id); // Stocke l'ID
      localStorage.setItem('role', user.role); // Stocke le rôle
      localStorage.setItem('email', user.email); // Stocke l'email

      console.log('User successfully logged in:', user); // Log pour le débogage

      // Redirection vers la page appropriée
      if (role === 'Student') {
        navigate('/student-profile');
      } else if (role === 'Professor') {
        navigate('/professor-profile');
      }
    } catch (error) {
      const err = error as any; // Transtypage
      if (err.response?.status === 401) {
        setMessage('Invalid email or password.');
      } else if (err.response?.status === 403) {
        setMessage('Choose the correct role.');
      } else {
        setMessage('An error occurred while logging in. Please try again.');
      }
      setIsError(true);
      console.error('Login Error:', error); // Log de l'erreur pour le débogage
    }
  };

  // Fonction pour gérer l'inscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/subscribe', {
        email,
        password,
        role,
      });

      setMessage('User successfully subscribed.');
      setIsError(false);
      console.log('User successfully subscribed:', response.data);
    } catch (error) {
      const err = error as any;
      if (err.response?.status === 409) {
        setMessage('Email déjà existant.');
      } else {
        setMessage('An error occurred while subscribing. Please try again.');
      }
      setIsError(true);
      console.error('Subscribe Error:', error);
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
        <div className="card shadow p-3">
          <h1 className="text-center mb-4">Welcome</h1>
          <form>
            <div className="form-group mb-2">
              <label htmlFor="email">Email :</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  className="form-control form-control-sm"
                  id="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password">Password :</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  className="form-control form-control-sm"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group select-group mb-3">
              <label htmlFor="profile">Profile :</label>
              <select
                className="form-control form-control-sm"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
              </select>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember password
              </label>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleLogin}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={handleSubscribe}
              >
                Subscribe
              </button>
            </div>
            {/* Message d'erreur ou de succès */}
            {message && (
              <p
                className={`text-center mt-3 ${isError ? 'text-danger' : 'text-success'}`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark text-white">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
