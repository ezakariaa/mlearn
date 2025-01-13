import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import axios from 'axios';

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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get<Course[]>(`http://localhost:5000/api/courses`);
        setAvailableCourses(response.data);
        setFilteredCourses(response.data);

        // Extraire les catégories uniques
        const uniqueCategories = Array.from(new Set(response.data.map((course) => course.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        setMessage('Failed to fetch courses.');
      }
    };

    fetchCourses();
  }, []);

  // Filtrer les cours par catégorie
  const handleFilterChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Réinitialiser à la première page
    if (category === '') {
      setFilteredCourses(availableCourses);
    } else {
      setFilteredCourses(availableCourses.filter((course) => course.category === category));
    }
  };

  // Calculer les cours affichés sur la page actuelle
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Gestion de la pagination
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-left">Browse Available Courses</h1>

          {/* Filtre par catégorie */}
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
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredCourses.length > coursesPerPage && (
          <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              <i className="bi bi-chevron-left"></i> Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-primary"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
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
