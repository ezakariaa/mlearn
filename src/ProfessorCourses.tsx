import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import Navbar from './components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaClock, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  duration: string;
  studentCount: number; // Nombre d'étudiants souscrits
}

const ProfessorCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;
  const navigate = useNavigate();

  const professorId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCourses = async () => {
      if (!professorId) {
        setMessage('No professor ID found.');
        return;
      }

      try {
        const response = await axios.get<Course[]>(`http://localhost:5000/api/professor/${professorId}/courses`);
        if (response.data.length === 0) {
          setMessage('No courses created by You, Professor.');
        } else {
          setCourses(response.data || []);
          setMessage('');
        }
      } catch (error) {
        console.error('Error fetching professor courses:', error);
        setMessage('Failed to fetch courses. Please try again later.');
      }
    };

    fetchCourses();
  }, [professorId]);

  const handleDeleteCourse = async (courseId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this course?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete the course. Please try again.');
    }
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="professor-page d-flex flex-column min-vh-100">
      <div className="container mt-3 pt-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="custom-title">List of your proposed courses</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/add-course')}
          >
            Add Course
          </button>
        </div>

        {message && <p className="text-danger text-left">{message}</p>}

        <div className="courses-container">
          {currentCourses.length === 0 && !message ? (
            <p className="text-left">No courses available.</p>
          ) : (
            currentCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  {/* Lien pour rediriger vers CourseStudents.tsx */}
                  <Link
                    to={`/course/${course.id}/students`}
                    className="course-title-link"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h5>{course.title}</h5>
                  </Link>
                  <span className="category-badge">{course.category.toUpperCase()}</span>
                </div>
                <p className="course-description">
                  {course.description.split(' ').slice(0, 20).join(' ')}...
                </p>
                <div className="course-info">
                  <span>
                    <FaBook className="me-1 text-success" />
                    <strong>{course.studentCount} students enrolled</strong>
                  </span>
                  <span>
                    <FaClock className="me-1 text-success" />
                    Duration: {course.duration} hours
                  </span>
                  <span>
                    <FaMapMarkerAlt className="me-1 text-danger" />
                    Location: {course.location}
                  </span>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-outline-danger btn-small d-flex align-items-center justify-content-center"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <FaTrash className="me-2" style={{ fontSize: '14px' }} />
                    DELETE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {courses.length > coursesPerPage && (
          <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <footer className="footer bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfessorCourses;
