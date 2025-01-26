import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import { BsPerson, BsStar, BsEnvelope, BsTelephone, BsBookFill, BsTelephoneFill, BsEnvelopeFill, BsPersonFill, BsStarFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

interface ProfessorProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  profile_picture: string;
  presentation: string;
  interests: string;
  proposed_courses?: ProposedCourse[];
}

interface ProposedCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string;
}

const ProfessorProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProfessorProfileData | null>(null);
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
        const response = await axios.get<ProfessorProfileData>(
          `http://localhost:5000/api/users/profile?email=${userEmail}`
        );
        const profileData = response.data;
        setProfile(profileData);

        // Fetch proposed courses
        const coursesResponse = await axios.get<ProposedCourse[]>(
          `http://localhost:5000/api/professor/${profileData.id}/courses`
        );
        setProfile((prevProfile) =>
          prevProfile ? { ...prevProfile, proposed_courses: coursesResponse.data } : null
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
    return <p className="text-center mt-5 text-danger">Impossible de charger les données du profil.</p>;
  }

  return (
    <>
      <div className="container mt-5 p-3 mb-auto">
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
            <h4 className="mt-2" style={{ fontSize: '1.5rem' }}>{profile.name}</h4>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              {profile.city}, {profile.country}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Profil: </strong> Professor
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
  <h5 className="text-primary" style={{ fontSize: '1.2rem' }}>
    <BsPersonFill className="me-1" /> Présentation :
  </h5>
  <p
    className="mt-2"
    style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}
  >
    {profile.presentation ? profile.presentation : 'Aucune présentation disponible.'}
  </p>
  <h6 className="mt-3 text-primary" style={{ fontSize: '1.2rem' }}>
    <BsStarFill className="me-1" /> Interests :
  </h6>
  <ul className="list-disc" style={{ fontSize: '0.9rem', listStyleType: 'disc', paddingLeft: '20px' }}>
    {profile.interests ? (
      profile.interests.split(',').map((interest, index) => (
        <li key={index}>{interest.trim()}</li>
      ))
    ) : (
      <li>Aucun centre d'intérêt disponible.</li>
    )}
  </ul>
</div>

              <div className="col-md-6">
                <h5 className="text-primary " style={{ fontSize: '1.2rem' }}>
                   Last Proposed Courses:
                </h5>
                <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                  {profile.proposed_courses && profile.proposed_courses.length > 0 ? (
                    profile.proposed_courses.slice(0, 6).map((course) => (
                      <li key={course.id} className="mb-2">
                        <div className="d-flex align-items-center">
                          <BsBookFill className="text-warning me-2" />
                          <h6 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{course.title}</h6>
                        </div>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0' }}>
                          {course.description.split(' ').slice(0, 22).join(' ')}...
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'gray' }}>
                          {course.category} - {course.location}
                        </p>
                        <hr className="my-2" />
                      </li>
                    ))
                  ) : (
                    <li>No proposed courses available.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer bg-dark text-white py-2 mt-3 text-center rounded">
        <p style={{ fontSize: '0.8rem' }}>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
      </footer>
    </>
  );
};

export default ProfessorProfile;
