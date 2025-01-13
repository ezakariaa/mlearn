import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import axios from 'axios';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  professor_id: number;
}

const Student: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [subscribedCourses, setSubscribedCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');

  // Récupérer l'étudiant connecté
  const studentId = localStorage.getItem('studentId'); // ID de l'étudiant connecté

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Récupérer tous les cours disponibles
        const availableResponse = await axios.get<Course[]>(
          'http://localhost:5000/api/courses'
        );
        setAvailableCourses(availableResponse.data);

        // Récupérer les cours auxquels l'étudiant a souscrit
        if (studentId) {
          const subscribedResponse = await axios.get<Course[]>(
            `http://localhost:5000/api/student/${studentId}/subscribed-courses`
          );
          setSubscribedCourses(subscribedResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
        setMessage('Failed to fetch courses.');
      }
    };

    fetchCourses();
  }, [studentId]);

  return (
    <div className="student-page d-flex flex-column min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            MLEARN
          </a>
        </div>
      </nav>

      {/* Contenu de la page */}
      <div className="container mt-4">
        {/* Bloc 1 */}
        <div className="mb-5">
          <h1 className="text-left">Bienvenue dans votre espace étudiant</h1>
          <h2 className="text-left mb-3">Consultez nos cours</h2>

          {message && <p className="text-danger text-left">{message}</p>}

          {availableCourses.length === 0 ? (
            <p className="text-left">Aucun cours disponible pour le moment.</p>
          ) : (
            <ul className="list-group">
              {availableCourses.map((course) => (
                <li key={course.id} className="list-group-item">
                  <div>
                    <h5 style={{ color: '#007bff' }} className="mb-1">
                      {course.title}
                    </h5>
                    <button className="category-button mb-2">
                      {course.category.toUpperCase()}
                    </button>
                    <p className="mb-2">{course.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bloc 2 */}
        <div>
          <h2 className="text-left mb-3">Liste des cours auxquels vous avez souscrit</h2>

          {subscribedCourses.length === 0 ? (
            <p className="text-left">
              Vous n'avez souscrit à aucun cours pour le moment.
            </p>
          ) : (
            <ul className="list-group">
              {subscribedCourses.map((course) => (
                <li key={course.id} className="list-group-item">
                  <div>
                    <h5 style={{ color: '#007bff' }} className="mb-1">
                      {course.title}
                    </h5>
                    <button className="category-button mb-2">
                      {course.category.toUpperCase()}
                    </button>
                    <p className="mb-2">{course.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Student;
