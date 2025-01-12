import React, { useEffect, useState } from 'react';
import './styles/styles.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
}

const Professor: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');

  // Dynamique : Simulation d'un professeur connecté (vous pouvez remplacer par un contexte ou localStorage)
  const loggedInProfessorId = localStorage.getItem('professorId') || '4'; // Exemple de récupération

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get<Course[]>(
          `http://localhost:5000/api/professor/${loggedInProfessorId}/courses`
        );
        setCourses(response.data);
        setFilteredCourses(response.data);

        // Récupérer les catégories uniques
        const uniqueCategories = Array.from(
          new Set(response.data.map((course) => course.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        setMessage('Failed to fetch courses.');
      }
    };

    fetchCourses();
  }, [loggedInProfessorId]);

  const handleDelete = async (courseId: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      setCourses(courses.filter((course) => course.id !== courseId));
      setFilteredCourses(
        filteredCourses.filter((course) => course.id !== courseId)
      );
      setMessage('Course deleted successfully.');
    } catch (error) {
      setMessage('Failed to delete the course.');
    }
  };

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category);
    if (category === '') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(
        courses.filter((course) => course.category === category)
      );
    }
  };

  return (
    <div className="professor-page d-flex flex-column min-vh-100">
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
        <h1 className="text-left">Welcome to your profile, Professor</h1>
        <h2 className="text-left mb-4">List of your proposed courses</h2>

        {/* Filtre par catégorie */}
        <div className="d-flex justify-content-end mb-3">
          <label className="me-2 mt-1">Filter by:</label>
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

        {message && <p className="text-danger text-left">{message}</p>}

        {filteredCourses.length === 0 ? (
          <p className="text-left">No courses found for the selected category.</p>
        ) : (
          <ul className="list-group">
            {filteredCourses.map((course) => (
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
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => alert(`Edit course ID: ${course.id}`)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(course.id)}
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
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

export default Professor;
