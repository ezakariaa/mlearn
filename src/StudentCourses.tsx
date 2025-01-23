import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import Navbar from './components/Navbar'; // Importation et utilisation de Navbar
import axios from 'axios';
import { FaBook, FaTrash, FaUser, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  professor_id: number;
  location: string;
  duration: string;
  professor: string; // Propriété pour le nom du professeur
}

const Student: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [subscribedCourseDetails, setSubscribedCourseDetails] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [subscribedPage, setSubscribedPage] = useState(1);
  const [subscribedCourses, setSubscribedCourses] = useState<number[]>([]);

  const coursesPerPage = 6;
  const subscribedPerPage = 6;

  const userEmail = localStorage.getItem('email') || 'Non identifié';
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get<Course[]>('http://localhost:5000/api/courses');
        setAvailableCourses(response.data || []);
        setFilteredCourses(response.data || []);
        const uniqueCategories = Array.from(new Set(response.data.map(course => course.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setMessage('Failed to fetch courses.');
      }
    };

    const fetchSubscribedCourses = async () => {
      try {
        const response = await axios.get<Course[]>(`http://localhost:5000/api/student/${studentId}/subscribed-courses`);
        setSubscribedCourseDetails(response.data || []);
        setSubscribedCourses(response.data.map(course => course.id));
      } catch (error) {
        console.error('Error fetching subscribed courses:', error);
      }
    };

    fetchCourses();
    if (studentId) {
      fetchSubscribedCourses();
    }
  }, [studentId]);

  const handleSubscribe = async (courseId: number) => {
    try {
      await axios.post('http://localhost:5000/api/course_students', {
        course_id: courseId,
        student_id: studentId,
      });
      setSubscribedCourses(prev => [...prev, courseId]);
      const courseDetails = availableCourses.find(course => course.id === courseId);
      if (courseDetails) {
        setSubscribedCourseDetails(prev => [...prev, courseDetails]);
      }
    } catch (error) {
      console.error('Error subscribing to course:', error);
      alert('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  };

  const handleDeleteSubscription = async (courseId: number) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/course_students/${studentId}/${courseId}`);
      setSubscribedCourses(prev => prev.filter(id => id !== courseId));
      setSubscribedCourseDetails(prev => prev.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Erreur lors de la suppression. Veuillez réessayer.');
    }
  };

  const handleFilterChange = (category: string) => {
    setCurrentPage(1);
    if (category === '') {
      setFilteredCourses(availableCourses);
    } else {
      setFilteredCourses(availableCourses.filter(course => course.category === category));
    }
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

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

  const indexOfLastSubscribed = subscribedPage * subscribedPerPage;
  const indexOfFirstSubscribed = indexOfLastSubscribed - subscribedPerPage;
  const currentSubscribedCourses = subscribedCourseDetails.slice(indexOfFirstSubscribed, indexOfLastSubscribed);

  const subscribedTotalPages = Math.ceil(subscribedCourseDetails.length / subscribedPerPage);

  const handleSubscribedNextPage = () => {
    if (subscribedPage < subscribedTotalPages) {
      setSubscribedPage(subscribedPage + 1);
    }
  };

  const handleSubscribedPrevPage = () => {
    if (subscribedPage > 1) {
      setSubscribedPage(subscribedPage - 1);
    }
  };

  return (
    <div className="student-page d-flex flex-column min-vh-100">
      <div className="container mt-3 pt-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="custom-title">Browse Available Courses</h2>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <strong>Connecté :</strong> {userEmail}
          </div>

          <div className="filter-container d-flex align-items-center">
            <label className="me-2" style={{ whiteSpace: 'nowrap' }}>Sort by:</label>
            <select
              className="form-select"
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && <p className="text-danger text-left">{message}</p>}

        <div className="courses-container">
          {currentCourses.length === 0 ? (
            <p className="text-left">No courses available for the selected category.</p>
          ) : (
            currentCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h5>{course.title}</h5>
                  <span className="category-badge">{course.category.toUpperCase()}</span>
                </div>
                <p className="course-description">{course.description}</p>
                <div className="course-info">
                  <span><FaUser className="me-1 text-primary" /><strong>Professor: {course.professor}</strong></span>
                  <span><FaClock className="me-1 text-success" />Duration: {course.duration}</span>
                  <span><FaMapMarkerAlt className="me-1 text-danger" />Location: {course.location}</span>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-outline-primary d-flex align-items-center"
                    onClick={() => handleSubscribe(course.id)}
                    disabled={subscribedCourses.includes(course.id)}
                  >
                    <FaBook className="me-2" />
                    {subscribedCourses.includes(course.id) ? 'Souscrit' : 'Souscrire'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredCourses.length > coursesPerPage && (
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

        <div className="mt-5">
          <h2 className="custom-title">Courses you have subscribed to:</h2>
          {currentSubscribedCourses.length === 0 ? (
            <p>You have not subscribed to any courses yet.</p>
          ) : (
            <div className="courses-container">
              {currentSubscribedCourses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h5>{course.title}</h5>
                    <span className="category-badge">{course.category.toUpperCase()}</span>
                  </div>
                  <p className="course-description">{course.description}</p>
                  <div className="course-info">
                    <span><FaUser className="me-1 text-primary" /><strong>Professor: {course.professor}</strong></span>
                    <span><FaClock className="me-1 text-success" />Duration: {course.duration}</span>
                    <span><FaMapMarkerAlt className="me-1 text-danger" />Location: {course.location}</span>
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      className="btn btn-outline-danger d-flex align-items-center"
                      onClick={() => handleDeleteSubscription(course.id)}
                    >
                      <FaTrash className="me-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {subscribedCourseDetails.length > subscribedPerPage && (
            <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-primary"
                disabled={subscribedPage === 1}
                onClick={handleSubscribedPrevPage}
              >
                Previous
              </button>
              <span>
                Page {subscribedPage} of {subscribedTotalPages}
              </span>
              <button
                className="btn btn-outline-primary"
                disabled={subscribedPage === subscribedTotalPages}
                onClick={handleSubscribedNextPage}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="footer bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Student;
