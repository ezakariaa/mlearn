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
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // URL de l'aperçu de l'image
  const navigate = useNavigate();

  const professorId = localStorage.getItem('userId');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !duration || !image) {
      setMessage('Please fill in all required fields and choose an image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('duration', String(duration));
    formData.append('professor_id', professorId || '');
    formData.append('course_image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setMessage('Course added successfully!');
        setTimeout(() => {
          navigate('/professor-courses');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage('Failed to add the course. Please try again.');
    }
  };

  return (
    <div className="add-course-page d-flex flex-column min-vh-100 p-3">
      <div className="container mt-4 p-3">
        <h2 className="custom-title mb-4">Add a New Course</h2>

        {message && <p className={`text-${message.includes('success') ? 'success' : 'danger'}`}>{message}</p>}

        <form onSubmit={handleSubmit} className="row shadow p-4">
          {/* Colonne gauche : Image */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label htmlFor="courseImage" style={{ fontWeight: 'bold' }}>Course Image:</label>
              <input
                type="file"
                className="form-control"
                id="courseImage"
                name="course_image"
                onChange={handleImageChange}
                accept="image/*"
                required
              />
            </div>
            {preview && (
              <div className="mt-3 text-center">
                <p style={{ fontWeight: 'bold' }}>Preview Image:</p>
                <img
                  src={preview}
                  alt="Course Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
            )}
          </div>

          {/* Colonne droite : Formulaire */}
          <div className="col-md-8">
            <div className="form-group mb-3">
              <label htmlFor="title" style={{ fontWeight: 'bold' }}>Course Title:</label>
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
              <label htmlFor="description" style={{ fontWeight: 'bold' }}>Course Description:</label>
              <textarea
                className="form-control"
                id="description"
                placeholder="Enter course description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: '280px' }} // Hauteur augmentée
                required
              ></textarea>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="category" style={{ fontWeight: 'bold' }}>Category:</label>
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
                <option value="Languages">Languages</option>
                <option value="New Technologies">New Technologies</option>
                <option value="School Support">School Support</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="location" style={{ fontWeight: 'bold' }}>Location:</label>
              <select
                className="form-control"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="Online">Online</option>
                <option value="At Home">At Home</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label htmlFor="duration" style={{ fontWeight: 'bold' }}>Duration (hours):</label>
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
            {/* Boutons alignés à droite */}
            <div className="form-group mb-3 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary btn-sm me-2">
                Add Course
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/professor-courses')}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      <footer className="footer bg-dark text-white mt-auto">
        <div className="container text-center">
          <p>&copy; Zakaria ELORCHE & Badr Toumani - ALX Project</p>
        </div>
      </footer>
    </div>
  );
};

export default AddCourse;
