import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/styles.css';

const Students: React.FC = () => {
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    // Supprimer les informations de l'utilisateur (par exemple, dans le stockage local ou un contexte global)
    localStorage.clear();
    // Rediriger vers la page Home
    navigate('/');
  };

  return (
    <Layout>
      <div className="caontainer mt-5">
        <h1>Bienvenue dans votre espace étudiant</h1>
        <p>Explorez vos cours et gérez votre profil.</p>

        {/* Liens rapides */}
        <div className="mt-4">
          <button className="btn btn-primary me-3" onClick={() => navigate('/students/profile')}>
            Profil
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/students/courses')}>
            Cours
          </button>
        </div>

        {/* Bouton de déconnexion */}
        <div className="mt-4">
          <button className="btn btn-danger" onClick={handleLogout}>
            Quitter
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Students;
