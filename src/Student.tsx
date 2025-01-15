import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import axios from 'axios';
import { FaBook } from 'react-icons/fa';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  professor_id: number;
  location: string;
  duration: string;
}

const Student: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [subscribedCourseDetails, setSubscribedCourseDetails] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [subscribedCourses, setSubscribedCourses] = useState<number[]>([]); // État pour stocker les cours souscrits
  const coursesPerPage = 9;

  // Simulez l'ID de l'étudiant connecté (à remplacer par une vraie logique d'authentification)
  const studentId = 1;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get<Course[]>(`http://localhost:5000/api/courses`);
        setAvailableCourses(response.data);
        setFilteredCourses(response.data);

        const uniqueCategories = Array.from(new Set(response.data.map((course) => course.category)));
        setCategories(uniqueCategories);

        // Récupérer les cours souscrits par l'étudiant
        const subscribedResponse = await axios.get<{ id: number }[]>(
          `http://localhost:5000/api/student/${studentId}/subscribed-courses`
        );
        const subscribedCourseIds = subscribedResponse.data.map((course) => course.id);
        setSubscribedCourses(subscribedCourseIds);

        // Récupérer les détails des cours souscrits
        const subscribedDetails = response.data.filter((course) =>
          subscribedCourseIds.includes(course.id)
        );
        setSubscribedCourseDetails(subscribedDetails);
      } catch (error) {
        setMessage('Failed to fetch courses.');
      }
    };

    fetchCourses();
  }, [studentId]);

  const handleSubscribe = async (courseId: number) => {
    try {
      // Appel à l'API pour inscrire un étudiant au cours
      const response = await axios.post('http://localhost:5000/api/course_students', {
        course_id: courseId,
        student_id: studentId,
      });

      if (response.status === 200) {
        alert('Inscription réussie !');
        setSubscribedCourses((prev) => [...prev, courseId]); // Ajouter le cours souscrit à la liste

        // Ajouter les détails du cours souscrit
        const courseDetails = availableCourses.find((course) => course.id === courseId);
        if (courseDetails) {
          setSubscribedCourseDetails((prev) => [...prev, courseDetails]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription au cours :', error);
      alert('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  };

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === '') {
      setFilteredCourses(availableCourses);
    } else {
      setFilteredCourses(availableCourses.filter((course) => course.category === category));
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

  return (
    <div className="student-page d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            MLEARN
          </a>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-left">Browse Available Courses</h1>

          <div className="filter-container">
            <label className="me-2">Filter by:</label>
            <select
              className="form-control w-auto"
              value={selectedCategory}
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
            currentCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h5>{course.title}</h5>
                  <span className="category-badge">{course.category.toUpperCase()}</span>
                </div>
                <p className="course-description">{course.description}</p>
                <div className="course-info">
                  <span>Duration: {course.duration}</span>
                  <span>Location: {course.location}</span>
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

        {/* Section des cours souscrits */}
        <div className="mt-5">
          <h2>Courses you have subscribed to:</h2>
          {subscribedCourseDetails.length === 0 ? (
            <p>You have not subscribed to any courses yet.</p>
          ) : (
            <div className="courses-container">
              {subscribedCourseDetails.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h5>{course.title}</h5>
                    <span className="category-badge">{course.category.toUpperCase()}</span>
                  </div>
                  <p className="course-description">{course.description}</p>
                  <div className="course-info">
                    <span>Duration: {course.duration}</span>
                    <span>Location: {course.location}</span>
                  </div>
                </div>
              ))}
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
