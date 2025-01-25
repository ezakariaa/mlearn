import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/styles.css';

const EditCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // Aperçu de l'image
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Récupération des détails du cours
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
        const { title, description, category, location, duration, course_image } = response.data;

        setTitle(title);
        setDescription(description);
        setCategory(category);
        setLocation(location);
        setDuration(duration);

        if (course_image) {
          setPreview(`http://localhost:5000${course_image}`);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setMessage('Failed to fetch course details. Please try again.');
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Gestion de l'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission de la mise à jour
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !location || !duration) {
      setMessage('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('duration', String(duration));
    if (image) {
      formData.append('course_image', image);
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/courses/${courseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setMessage('Course updated successfully!');
        setTimeout(() => {
          navigate('/professor-courses'); // Redirection vers la liste des cours
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage('Failed to update the course. Please try again.');
    }
  };

  // Annulation de la modification
  const handleCancel = () => {
    navigate('/professor-courses'); // Retour à la page précédente
  };

  return (
    <div className="edit-course-page d-flex flex-column min-vh-100">
      <div className="container mt-4">
        <h2 className="custom-title mb-4">Edit Course</h2>

        {/* Message de succès ou d'erreur */}
        {message && <p className={`text-${message.includes('success') ? 'success' : 'danger'}`}>{message}</p>}

        <form onSubmit={handleUpdateCourse} className="row shadow p-4">
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
              />
            </div>
            {preview && (
              <div className="mt-3 text-center">
                <p>Preview Image:</p>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ minHeight: '280px' }} // Zone de texte agrandie
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
                value={duration}
                onChange={(e) => setDuration(e.target.valueAsNumber || '')}
                required
              />
            </div>

            {/* Boutons Update et Cancel */}
            <div className="d-flex justify-content-center gap-3">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{
                  fontSize: '0.85rem',
                  padding: '8px 15px',
                  borderRadius: '5px',
                }}
              >
                Update Course
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancel}
                style={{
                  fontSize: '0.85rem',
                  padding: '8px 15px',
                  borderRadius: '5px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
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

export default EditCourse;
