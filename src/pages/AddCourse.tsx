import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddCourse: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Soutien Scolaire');
  const [location, setLocation] = useState('Online');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Récupérer l'utilisateur connecté
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || user.role !== 'Professeur') {
      setMessage('Vous devez être connecté en tant que professeur.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('professorId', user.id);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5000/add-course', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      navigate('/teacher-courses'); // Rediriger vers la liste des cours
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du cours:', err);
      setMessage('Erreur lors de l\'ajout du cours.');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Ajouter un cours</h1>
      {message && <p className="text-danger">{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Titre</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Catégorie</label>
          <select
            className="form-select"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option>Soutien Scolaire</option>
            <option>Langue</option>
            <option>Coding</option>
            <option>Arts</option>
            <option>Nouvelle Technologies</option>
            <option>Autres</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="location" className="form-label">Lieu</label>
          <select
            className="form-select"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option>Online</option>
            <option>À Domicile</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            id="image"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Ajouter le cours</button>
      </form>
    </div>
  );
};

export default AddCourse;
