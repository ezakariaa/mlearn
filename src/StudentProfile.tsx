import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  BsPersonFill,
  BsStarFill,
  BsEnvelopeFill,
  BsTelephoneFill,
  BsBookmarkCheck,
} from 'react-icons/bs';

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
    <>
      <div className="container mt-5 mb-auto">
        <div className="row">
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
            <h4 className="mt-2" style={{ fontSize: '1.2rem' }}>
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
              <FaEdit className="me-1" /> Modifier
            </button>
          </div>

          <div className="col-md-8">
            <div className="row gx-5">
              <div className="col-md-6">
                <h5 className="text-primary" style={{ fontSize: '1rem' }}>
                  <BsPersonFill className="me-1" /> Présentation :
                </h5>
                <p style={{ fontSize: '0.9rem' }}>
                  {profile.presentation || 'Aucune présentation disponible.'}
                </p>
                <h5
                  className="text-primary mt-3"
                  style={{ fontSize: '1rem' }}
                >
                  <BsStarFill className="me-1" /> Interests :
                </h5>
                <ul
                  className="list-disc"
                  style={{
                    fontSize: '0.9rem',
                    listStyleType: 'disc',
                    paddingLeft: '20px',
                  }}
                >
                  {profile.interests
                    ? profile.interests.split(',').map((interest, index) => (
                        <li key={index}>{interest.trim()}</li>
                      ))
                    : (
                      <li>Aucun centre d'intérêt disponible.</li>
                    )}
                </ul>
              </div>

              <div className="col-md-6">
                <h5
                  className="text-primary"
                  style={{ fontSize: '1rem', marginBottom: '1rem' }}
                >
                  <BsStarFill className="me-1" /> Derniers Cours Souscrits :
                </h5>
                <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                  {profile.subscribed_courses &&
                  profile.subscribed_courses.length > 0 ? (
                    profile.subscribed_courses.slice(0, 10).map((course, index) => (
                      <>
                        {index > 0 && (
                          <hr
                            style={{
                              borderTop: '1px solid #ccc',
                              margin: '10px 0',
                            }}
                          />
                        )}
                        <li
                          key={course.id}
                          className="mb-2 d-flex align-items-start"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            navigate(`/student-course/${course.id}`)
                          }
                        >
                          <BsBookmarkCheck className="me-2 text-primary" />
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
                                marginBottom: '0',
                              }}
                            >
                              {course.description
                                .split(' ')
                                .slice(0, 20)
                                .join(' ')}
                              ...
                            </p>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                color: 'gray',
                              }}
                            >
                              {course.category} - {course.location}
                            </p>
                          </div>
                        </li>
                      </>
                    ))
                  ) : (
                    <li>Aucun cours souscrit.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer bg-dark text-white py-2 mt-3 text-center rounded">
        <p style={{ fontSize: '0.8rem' }}>
          &copy; Zakaria ELORCHE & Badr Toumani - ALX Project
        </p>
      </footer>
    </>
  );
};

export default StudentProfile;
