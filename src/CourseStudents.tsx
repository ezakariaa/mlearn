import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import Navbar from './components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaTrash, FaEdit, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: number;
  course_image?: string; // Ajout de la propriété de l'image du cours
}

interface Student {
  id: number;
  name: string;
  email: string;
}

const CourseStudents: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get<Course>(`http://localhost:5000/api/courses/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setMessage('Failed to fetch course details.');
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get<Student[]>(`http://localhost:5000/api/course/${courseId}/students`);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setMessage('Failed to fetch students.');
      }
    };

    fetchCourse();
    fetchStudents();
  }, [courseId]);

  const handleDeleteStudent = async (studentId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this student from the course?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/course/${courseId}/students/${studentId}`);
      setStudents((prevStudents) => prevStudents.filter((student) => student.id !== studentId));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete the student. Please try again.');
    }
  };

  const handleEditCourse = () => {
    if (course) {
      navigate(`/edit-course/${course.id}`, { state: { course } }); // Redirection vers EditCourse avec les données du cours
    }
  };

  return (
    <div className="course-students-page d-flex flex-column min-vh-100">

      <div className="container mt-5 pt-3">
        {message && <p className="text-danger">{message}</p>}

        {/* Section Informations sur le cours */}
        <div className="mb-4 d-flex align-items-center">
          {course ? (
            <>
              <div className="course-image-container me-4">
                {course.course_image && (
                  <img
                    src={`http://localhost:5000${course.course_image}`} // Récupérer depuis le dossier /courses
                    alt="Course"
                    style={{
                      maxWidth: '400px',
                      maxHeight: '400px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                    }}
                  />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '34px', fontWeight: 'bold' }}>{course.title}</h3>
                <p>
                  <strong>Description:</strong> <span style={{ fontSize: '14px' }}>{course.description}</span>
                </p>
                <p>
                  <strong>Category:</strong> {course.category}
                </p>
                <p>
                  <FaClock className="me-2 text-success" />
                  <strong>Duration:</strong> {course.duration} hours
                </p>
                <p>
                  <FaMapMarkerAlt className="me-2 text-danger" />
                  <strong>Location:</strong> {course.location}
                </p>
                {/* Bouton Edit */}
                <button
                  className="btn btn-sm btn-primary d-flex align-items-center mt-2"
                  onClick={handleEditCourse}
                >
                  <FaEdit className="me-2" />
                  Edit Course
                </button>
              </div>
            </>
          ) : (
            <p>Loading course details...</p>
          )}
        </div>

        {/* Section Liste des étudiants inscrits */}
        <div>
          <h3 className="mb-3">Subscribed Students ({students.length})</h3>
          {students.length > 0 ? (
            <ul className="list-group">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{ fontSize: '14px' }}
                >
                  <div>
                    <FaUser className="me-2 text-primary" />
                    <strong>{student.name}</strong>
                  </div>
                  <div className="text-center" style={{ flex: 1, textAlign: 'center' }}>
                    <FaEnvelope className="me-2 text-secondary" />
                    {student.email}
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-danger d-flex align-items-center me-2"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <FaTrash className="me-2" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No students have subscribed to this course.</p>
          )}
        </div>
      </div>

      <footer className="footer bg-dark text-white mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default CourseStudents;
