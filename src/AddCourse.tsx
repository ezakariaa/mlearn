import React, { useState } from 'react';
import './styles/styles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddCourse: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Online');
  const [duration, setDuration] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Récupérer l'ID du professeur depuis localStorage
  const professorId = localStorage.getItem('userId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !duration) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/courses', {
        title,
        description,
        category,
        location,
        duration: Number(duration), // Convertir la durée en nombre
        professor_id: professorId, // Ajouter l'ID du professeur connecté
      });

      if (response.status === 201) {
        setMessage('Course added successfully!');
        setTimeout(() => {
          navigate('/professor-courses'); // Rediriger vers la page des cours
        }, 2000); // Attente de 2 secondes avant la redirection
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage('Failed to add the course. Please try again.');
    }
  };

  return (
    <div className="add-course-page d-flex flex-column min-vh-100">
      <div className="container mt-4">
        <h2 className="custom-title mb-4">Add a New Course</h2>

        {message && <p className={`text-${message.includes('success') ? 'success' : 'danger'}`}>{message}</p>}

        <form onSubmit={handleSubmit} className="form-container shadow p-4">
          <div className="form-group mb-3">
            <label htmlFor="title">Course Title:</label>
            <input
              type="text"
              className="form-control"
              id="title"
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="description">Course Description:</label>
            <textarea
              className="form-control"
              id="description"
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group mb-3">
            <label htmlFor="category">Category:</label>
            <select
              className="form-control"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Coding">Coding</option>
              <option value="Arts">Arts</option>
              <option value="Langues">Langages</option>
              <option value="Nouvelle Technologies">Nouvelle Technologies</option>
              <option value="Soutien Scolaire">Soutien Scolaire</option>
            </select>
          </div>
          <div className="form-group mb-3">
            <label htmlFor="location">Location:</label>
            <select
              className="form-control"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="Online">Online</option>
              <option value="À Domicile">À Domicile</option>
            </select>
          </div>
          <div className="form-group mb-3">
            <label htmlFor="duration">Duration (hours):</label>
            <input
              type="number"
              className="form-control"
              id="duration"
              placeholder="Enter course duration"
              value={duration}
              onChange={(e) => setDuration(e.target.valueAsNumber || '')}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Add Course
          </button>
        </form>
      </div>

      <footer className="footer bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default AddCourse;
