import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import '../styles/TeacherProfile.css'; // Utilisez le même fichier CSS que StudentProfile
import defaultTeacherAvatar from '../assets/images/teacher-ava.png'; // Import de l'image par défaut

const TeacherProfile: React.FC = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    role: 'Professeur',
    profilePicture: defaultTeacherAvatar, // Image par défaut pour le professeur
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser((prev) => ({
      ...prev,
      ...storedUser,
      profilePicture: storedUser.profilePicture || defaultTeacherAvatar,
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUser((prev) => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),
      }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/update-profile', {
        ...user,
        newPassword,
      });
      setMessage(response.data.message);
      localStorage.setItem('user', JSON.stringify(user));
      setIsEditing(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <h1>Votre Profil</h1>
        <div className="profile-content">
          <div className="profile-info">
            {!isEditing ? (
              <div>
                <ul className="list-group mt-3">
                  <li className="list-group-item">
                    <strong>Nom complet :</strong> {user.name || 'Non défini'}
                  </li>
                  <li className="list-group-item">
                    <strong>Email :</strong> {user.email}
                  </li>
                  <li className="list-group-item">
                    <strong>Téléphone :</strong> {user.phone || 'Non défini'}
                  </li>
                  <li className="list-group-item">
                    <strong>Ville :</strong> {user.city || 'Non défini'}
                  </li>
                  <li className="list-group-item">
                    <strong>Pays :</strong> {user.country || 'Non défini'}
                  </li>
                  <li className="list-group-item">
                    <strong>Rôle :</strong> {user.role}
                  </li>
                </ul>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => setIsEditing(true)}
                >
                  Changer mes informations
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                {/* Formulaire d'édition */}
                <div className="form-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email (non modifiable)</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Pays</label>
                  <input
                    type="text"
                    className="form-control"
                    name="country"
                    value={user.country}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Photo de profil</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                  {user.profilePicture && (
                    <img
                      src={user.profilePicture}
                      alt="Aperçu"
                      className="mt-3"
                      style={{ width: '150px', borderRadius: '50%' }}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Changer le mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success mt-3">
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mt-3 ms-3"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </button>
              </form>
            )}
          </div>

          <div className="profile-avatar">
            <img
              src={user.profilePicture || defaultTeacherAvatar}
              alt="Avatar utilisateur"
              className="img-thumbnail"
            />
          </div>
        </div>
        {message && <p className="mt-3 text-success">{message}</p>}
      </div>
    </Layout>
  );
};

export default TeacherProfile;
