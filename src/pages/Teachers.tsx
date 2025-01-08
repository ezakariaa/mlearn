import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Teachers: React.FC = () => {
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); // Rediriger vers la page d'accueil
  };

  return (
    <Layout>
      <div className="container mt-5">
        <h1>Bienvenue dans votre espace professeur</h1>
        <p>Gérez vos cours et consultez votre profil.</p>

        {/* Liens rapides */}
        <div className="mt-4">
          <button className="btn btn-primary me-3" onClick={() => navigate('/teachers/profile')}>
            Profil
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/teachers/courses')}>
            Cours
          </button>
        </div>

        {/* Bouton de déconnexion */}
        <div className="mt-4">
          <button className="btn btn-danger" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Teachers;
