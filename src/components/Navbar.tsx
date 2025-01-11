import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/styles.css'; // Unique fichier CSS pour éviter les conflits

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  // Récupérer les informations de l'utilisateur
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  // Gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('user'); // Supprimer les informations utilisateur
    navigate('/'); // Rediriger vers la page Home
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container">
        {/* Titre de la barre */}
        <Link
          className="navbar-brand"
          to={user ? (user.role === 'Professeur' ? '/teachers' : '/students') : '/'}
        >
          MLEARN
        </Link>

        {/* Bouton de menu responsive */}
        {user && (
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        )}

        {/* Liens de navigation (affichés uniquement après connexion) */}
        {user && (
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {user.role === 'Étudiant' ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/students">
                      Accueil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/students/profile">
                      Profil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/students/courses">
                      Cours
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" onClick={handleLogout}>
                      Se déconnecter
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/teachers">
                      Accueil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/teachers/profile">
                      Profil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/teachers/courses">
                      Cours
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" onClick={handleLogout}>
                      Se déconnecter
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
