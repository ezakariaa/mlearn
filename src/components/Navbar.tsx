import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
        <Link className="navbar-brand" to={user ? (user.role === 'Professeur' ? '/teachers' : '/students') : '/'}>
          MLEARN
        </Link>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Si l'utilisateur est un étudiant */}
            {user?.role === 'Étudiant' ? (
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
            ) : user?.role === 'Professeur' ? (
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
            ) : (
              // Pas de liens supplémentaires pour la page Home
              <></>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
