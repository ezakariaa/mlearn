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
  const [isLoading, setIsLoading] = useState(true); // État pour le chargement
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = localStorage.getItem('email');
      try {
        const response = await axios.get<StudentProfileData>(`http://localhost:5000/api/users/profile?email=${userEmail}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <p className="text-center mt-5">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-center mt-5 text-danger">Failed to load profile data.</p>;
  }

  return (
    <div className="container mt-5">
      <div className="profile-container shadow-lg rounded bg-white p-4">
        {/* Header Section */}
        <div className="text-center mb-4">
          <img
            src={profile.profile_picture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="rounded-circle"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              border: '4px solid #007bff',
            }}
          />
          <h2 className="mt-3">{profile.name || 'Name not provided'}</h2>
          <p className="text-muted">
            <FaMapMarkerAlt /> {profile.city || 'City not provided'}, {profile.country || 'Country not provided'}
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/edit-profile')} // Redirection vers la page d'édition
          >
            <FaEdit className="me-2" />
            Edit Profile
          </button>
        </div>

        {/* Details Section */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="info-card p-3 bg-light rounded">
              <h5 className="fw-bold text-primary">Contact Information</h5>
              <p>
                <FaEnvelope className="me-2" /> {profile.email}
              </p>
              <p>
                <FaPhone className="me-2" /> {profile.phone || 'Phone not provided'}
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-card p-3 bg-light rounded">
              <h5 className="fw-bold text-primary">About Me</h5>
              <p>
                {`Welcome to my profile. My name is ${profile.name || 'Unknown'}. I am from ${profile.city || 'N/A'}, ${
                  profile.country || 'N/A'
                }.`}
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
