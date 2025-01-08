import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';
import StudyImage from '../assets/images/home-image.png';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState('Étudiant');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs vides
    if (!email.trim() || !password.trim()) {
      setMessage('Veuillez saisir une adresse email et un mot de passe.');
      return;
    }

    try {
      // Appeler l'API de connexion
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      const { user } = response.data;

      // Vérification du rôle et redirection
      if (user.role === 'Étudiant' && profile === 'Étudiant') {
        localStorage.setItem('user', JSON.stringify(user)); // Stocker les infos utilisateur
        navigate('/students'); // Redirige vers la page Étudiants
      } else if (user.role === 'Professeur' && profile === 'Professeur') {
        localStorage.setItem('user', JSON.stringify(user)); // Stocker les infos utilisateur
        navigate('/teachers'); // Redirige vers la page Professeurs
      } else {
        setMessage('Le rôle sélectionné ne correspond pas à votre compte.');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur de connexion.');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs vides
    if (!email.trim() || !password.trim()) {
      setMessage('Veuillez saisir une adresse email et un mot de passe.');
      return;
    }

    try {
      // Appeler l'API d'inscription
      const response = await axios.post('http://localhost:5000/register', {
        email,
        password,
        role: profile,
      });
      setMessage(response.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    }
  };

  return (
    <div>
      {/* Contenu principal */}
      <main className="container-main">
        <div className="content">
          {/* Colonne de gauche avec l'image */}
          <div className="image-container">
            <img src={StudyImage} alt="Study Illustration" />
          </div>

          {/* Colonne de droite avec le formulaire */}
          <div className="form-container">
            <h1>Bienvenue sur MLEARN</h1>
            <form>
              <div className="form-group">
                <label htmlFor="email">Adresse Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de Passe</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile">Profil</label>
                <select
                  className="form-control"
                  id="profile"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                >
                  <option>Étudiant</option>
                  <option>Professeur</option>
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
                <label className="form-check-label" htmlFor="remember">Se rappeler du mot de passe</label>
              </div>
              <div className="d-flex gap-3 mt-3">
                <button onClick={handleLogin} className="btn btn-primary">
                  <i className="fas fa-sign-in-alt"></i> Login
                </button>
                <button onClick={handleSubscribe} className="btn btn-secondary">
                  <i className="fas fa-user-plus"></i> Souscrire
                </button>
              </div>
            </form>
            {message && <p className="mt-3 text-danger">{message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
