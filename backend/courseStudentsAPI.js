const express = require('express');
const router = express.Router();
const db = require('./db'); // Adaptez selon votre configuration pour la base de données

// API pour ajouter un étudiant à un cours
router.post('/api/course_students', async (req, res) => {
  const { course_id, student_id } = req.body;

  // Validation des données
  if (!course_id || !student_id) {
    return res.status(400).json({ message: 'Course ID et Student ID sont requis.' });
  }

  try {
    // Insertion dans la table course_students
    await db.query(
      'INSERT INTO course_students (course_id, student_id) VALUES (?, ?)',
      [course_id, student_id]
    );
    res.status(200).json({ message: 'Inscription réussie !' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

module.exports = router;
