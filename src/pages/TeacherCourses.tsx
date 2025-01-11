import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import de useNavigate
import Layout from '../components/Layout';
import axios from 'axios';
import '../styles/styles.css';
import '../styles/TeacherCourses.css'; // Assurez-vous de personnaliser ce fichier CSS si nécessaire
import { FaCalendarAlt, FaMapMarkerAlt, FaBook, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; // Ajout de l'icône "Plus"

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  image?: string; // Optionnel pour inclure une image de cours
}

const TeacherCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Initialisation du hook useNavigate

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || user.role !== 'Professeur') {
      setErrorMessage('Vous devez être connecté en tant que professeur pour voir vos cours.');
      setLoading(false);
      return;
    }

    const professorId = user.id;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/teacher-courses?professorId=${professorId}`);
        setCourses(response.data); // Charger les cours dans l'état
        setErrorMessage(null);
      } catch (error: any) {
        console.error('Erreur lors de la récupération des cours:', error);
        setErrorMessage('Impossible de récupérer les cours.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleAddCourse = () => {
    navigate('/add-course'); // Redirige vers la page pour ajouter un cours
  };

  return (
    <Layout>
      <div className="container mt-5 content-wrapper">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="text-primary">Vos Cours</h1>
          <button className="btn btn-success" onClick={handleAddCourse}>
            <FaPlus className="me-2" />
            Ajouter un cours
          </button>
        </div>
        <p className="text-secondary">Liste des cours que vous proposez aux étudiants.</p>

        {/* Loader */}
        {loading && <p className="text-primary">Chargement en cours...</p>}

        {/* Message d'erreur */}
        {errorMessage && <p className="text-danger">{errorMessage}</p>}

        {/* Affichage des cours */}
        {!loading && courses.length > 0 ? (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {courses.map((course) => (
              <div key={course.id} className="col">
                <div className="card shadow-sm h-100">
                  <img
                    src={course.image || require('../assets/images/default-course-image.jpg')}
                    alt={course.title}
                    className="card-img-top rounded"
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary">
                      <FaBook className="me-2" />
                      {course.title}
                    </h5>
                    <p className="card-text">{course.description}</p>
                    <p className="text-muted">
                      <FaCalendarAlt className="me-2" />
                      {new Date(course.date).toLocaleDateString()}
                    </p>
                    <p className="text-muted">
                      <FaMapMarkerAlt className="me-2" />
                      {course.location}
                    </p>
                    <p>
                      <span className="badge bg-info">{course.category}</span>
                    </p>
                    <div className="mt-auto d-flex justify-content-between">
                      <button className="btn btn-warning btn-sm">
                        <FaEdit className="me-2" />
                        Modifier
                      </button>
                      <button className="btn btn-danger btn-sm">
                        <FaTrash className="me-2" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-muted">Aucun cours trouvé.</p>
        )}
      </div>
    </Layout>
  );
};

export default TeacherCourses;
