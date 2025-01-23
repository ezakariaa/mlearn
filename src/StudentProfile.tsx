import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import axios from 'axios';
import { FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface StudentProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  profile_picture: string;
}

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(''); // Gestion des erreurs
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = localStorage.getItem('email');

      if (!userEmail) {
        setErrorMessage('Email introuvable. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<StudentProfileData>(
          `http://localhost:5000/api/users/profile?email=${userEmail}`
        );
        setProfile(response.data);
      } catch (error) {
        const err = error as { response?: { status?: number } }; // Typage interne de l'erreur
        console.error('Erreur lors de la récupération du profil utilisateur :', err);
        if (err.response && err.response.status === 404) {
          setErrorMessage('Utilisateur non trouvé. Veuillez vérifier vos informations.');
        } else {
          setErrorMessage('Erreur lors du chargement des données utilisateur.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <p className="text-center mt-5">Chargement du profil...</p>;
  }

  if (errorMessage) {
    return <p className="text-center mt-5 text-danger">{errorMessage}</p>;
  }

  if (!profile) {
    return <p className="text-center mt-5 text-danger">Impossible de charger les données du profil.</p>;
  }

  return (
    <div className="container mt-5">
      <div className="profile-container shadow-lg rounded bg-white p-4">
        {/* Header Section */}
        <div className="text-center mb-4">
          <img
            src={
              profile.profile_picture
                ? `http://localhost:5000${profile.profile_picture}` // URL dynamique pour l'image
                : 'https://via.placeholder.com/150' // Image par défaut
            }
            alt="Profile"
            className="rounded-circle"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              border: '4px solid #007bff',
            }}
          />
          <h2 className="mt-3">{profile.name || 'Nom non fourni'}</h2>
          <p className="text-muted">
            <FaMapMarkerAlt /> {profile.city || 'Ville non fournie'}, {profile.country || 'Pays non fourni'}
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/edit-profile')} // Redirection vers la page d'édition
          >
            <FaEdit className="me-2" />
            Modifier le profil
          </button>
        </div>

        {/* Details Section */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="info-card p-3 bg-light rounded">
              <h5 className="fw-bold text-primary">Informations de contact</h5>
              <p>
                <FaEnvelope className="me-2" /> {profile.email}
              </p>
              <p>
                <FaPhone className="me-2" /> {profile.phone || 'Téléphone non fourni'}
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-card p-3 bg-light rounded">
              <h5 className="fw-bold text-primary">À propos de moi</h5>
              <p>
                {`Bienvenue sur mon profil. Je m'appelle ${profile.name || 'Inconnu'}. Je viens de ${
                  profile.city || 'N/A'
                }, ${profile.country || 'N/A'}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer bg-dark text-white py-3 mt-5 text-center rounded">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </footer>
      </div>
    </div>
  );
};

export default StudentProfile;
