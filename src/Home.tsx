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

  // Fonction de validation du formulaire
  const validateForm = () => {
    if (!email || !password || !role) {
      setMessage('Veuillez remplir tous les champs.');
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

      // Vérifie si le rôle sélectionné correspond au rôle de l'utilisateur
      if (user.role !== role) {
        setMessage('Le rôle sélectionné ne correspond pas à l\'utilisateur.');
        return;
      }

      // Stocke le rôle et l'email dans le localStorage
      localStorage.setItem('role', user.role);
      localStorage.setItem('email', user.email);

      // Redirige vers la page appropriée selon le rôle
      if (role === 'Student') {
        navigate('/student-profile');
      } else if (role === 'Professor') {
        navigate('/professor-profile');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      setMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
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
          <h1 className="text-center mb-4">Bienvenue sur MLEARN</h1>
          <form>
            <div className="form-group mb-3">
              <label htmlFor="email">Adresse email :</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Entrez votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password">Mot de passe :</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group select-group mb-3">
              <label htmlFor="profile">Profil :</label>
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
                Se souvenir du mot de passe
              </label>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleLogin}
              >
                Connexion
              </button>
            </div>
            {/* Message d'erreur ou de succès */}
            {message && <p className={`text-center mt-3 ${message.includes('erreur') ? 'text-danger' : 'text-success'}`}>{message}</p>}
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
