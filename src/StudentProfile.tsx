import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill, BsStarFill, BsEnvelopeFill, BsTelephoneFill } from 'react-icons/bs';

interface StudentProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  profile_picture: string;
  presentation: string;
  interests: string;
  subscribed_courses?: SubscribedCourse[];
}

interface SubscribedCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string;
  course_image?: string;
}

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
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
        const profileData = response.data;
        setProfile(profileData);

        const coursesResponse = await axios.get<SubscribedCourse[]>(
          `http://localhost:5000/api/student/${profileData.id}/subscribed-courses`
        );
        setProfile((prevProfile) =>
          prevProfile
            ? { ...prevProfile, subscribed_courses: coursesResponse.data }
            : null
        );
      } catch (error) {
        setErrorMessage('Erreur lors du chargement des données utilisateur.');
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
    return (
      <p className="text-center mt-5 text-danger">
        Impossible de charger les données du profil.
      </p>
    );
  }

  return (
    <div className="container mt-5 p-3 mb-auto">
      <div className="row">
        {/* Colonne gauche : Informations utilisateur */}
        <div className="col-md-4 text-center">
          <img
            src={
              profile.profile_picture
                ? `http://localhost:5000${profile.profile_picture}`
                : 'https://via.placeholder.com/150'
            }
            alt="Profile"
            className="rounded-circle border border-primary mb-3"
            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
          />
          <h4 className="mt-2" style={{ fontSize: '1.5rem' }}>
            {profile.name}
          </h4>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {profile.city}, {profile.country}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            <strong>Profil:</strong> Étudiant
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            <BsTelephoneFill className="me-1" /> {profile.phone}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            <BsEnvelopeFill className="me-1" /> {profile.email}
          </p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => navigate('/edit-profile')}
            style={{ fontSize: '0.8rem' }}
          >
            <FaEdit className="me-1" /> Edit Profile
          </button>
        </div>

        {/* Colonne centrale : Présentation et centres d'intérêt */}
        <div className="col-md-4">
          <h5 className="text-primary" style={{ fontSize: '1.2rem' }}>
            <BsPersonFill className="me-1" /> Presentation :
          </h5>
          <p
            style={{
              fontSize: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {profile.presentation || 'Aucune présentation disponible.'}
          </p>
          <h5 className="text-primary mt-4" style={{ fontSize: '1.2rem' }}>
            <BsStarFill className="me-1" /> Interests :
          </h5>
          <ul
            className="list-disc"
            style={{
              fontSize: '1rem',
              listStyleType: 'disc',
              paddingLeft: '20px',
            }}
          >
            {profile.interests
              ? profile.interests.split(',').map((interest, index) => (
                  <li key={index}>{interest.trim()}</li>
                ))
              : (
                <li>No interests available.</li>
              )}
          </ul>
        </div>

        {/* Colonne droite : Derniers cours souscrits */}
        <div className="col-md-4">
          <h5
            className="text-primary"
            style={{ fontSize: '1.2rem', marginBottom: '1rem' }}
          >
            Latest Courses Subscribed:
          </h5>
          <ul className="list-unstyled">
            {profile.subscribed_courses &&
            profile.subscribed_courses.length > 0 ? (
              profile.subscribed_courses.slice(0, 5).map((course) => (
                <li key={course.id} className="mb-3 d-flex align-items-start">
                  <img
                    src={
                      course.course_image
                        ? `http://localhost:5000${course.course_image}`
                        : 'https://via.placeholder.com/60'
                    }
                    alt={course.title}
                    style={{
                      width: '60px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '5px',
                      marginRight: '15px',
                    }}
                  />
                  <div>
                    <h6
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {course.title}
                    </h6>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {course.description.split(' ').slice(0, 20).join(' ')}...
                    </p>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'gray',
                      }}
                    >
                      {course.category} - {course.location}
                    </p>
                    <hr className="my-2" />
                  </div>
                  
                </li>
              ))
            ) : (
              <p>No courses subscribed.</p>
            )}
          </ul>
        </div>
      </div>
      <footer className="footer bg-dark text-white text-center">
        <p style={{ fontSize: '0.8rem' }}>
          &copy; Zakaria ELORCHE & Badr Toumani - ALX Project
        </p>
      </footer>
    </div>
  );
};

export default StudentProfile;
