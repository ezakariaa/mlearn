import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import axios from 'axios';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null); // État pour stocker le rôle
  const [isLoading, setIsLoading] = useState(true); // État pour gérer le chargement

  useEffect(() => {
    const fetchRole = async () => {
      const email = localStorage.getItem('email');
      const storedRole = localStorage.getItem('role');

      if (storedRole) {
        setRole(storedRole);
        setIsLoading(false); // Fin du chargement
      } else if (email) {
        try {
          const response = await axios.get(`http://localhost:5000/api/users/role?email=${email}`);
          const fetchedRole = response.data.role;

          if (fetchedRole) {
            localStorage.setItem('role', fetchedRole);
            setRole(fetchedRole);
          } else {
            console.error('Rôle non trouvé pour cet email.');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du rôle :', error);
        } finally {
          setIsLoading(false); // Fin du chargement
        }
      } else {
        setIsLoading(false); // Fin du chargement si aucun email
      }
    };

    fetchRole();
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Supprime toutes les données de session
    navigate('/'); // Redirige vers la page Home
  };

  // Affichage pour la page Home uniquement
  if (location.pathname === '/') {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">MLEARN</span>
        </div>
      </nav>
    );
  }

  // Affichage en cas de chargement
  if (isLoading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">MLEARN</span>
          <div className="ms-auto text-white">Chargement...</div>
        </div>
      </nav>
    );
  }

  // Affichage dynamique basé sur le rôle
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <span className="navbar-brand">MLEARN</span>
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {role === 'Student' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/student-profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student-courses">
                    Courses
                  </Link>
                </li>
              </>
            )}
            {role === 'Professor' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/professor-profile">
                    Accueil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/professor-courses">
                    Courses
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <button className="btn  btn-danger btn-sm nav-link text-white" onClick={handleLogout}>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
