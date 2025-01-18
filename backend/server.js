require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'votre_clé_secrète';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

// Route d'inscription
app.post('/api/signup', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';

  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'email :', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification de l\'email.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà enregistré.' });
    }

    db.query(insertQuery, [email, password, role], (err) => {
      if (err) {
        console.error('Erreur lors de l\'inscription de l\'utilisateur :', err);
        return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
      }

      return res.status(201).json({ message: 'Inscription réussie.' });
    });
  });
});

// Route de connexion
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Erreur lors de la connexion :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide.' });
    }

    const user = results[0];

    if (user.role !== role) {
      return res.status(403).json({ message: 'Le rôle sélectionné ne correspond pas à cet utilisateur.' });
    }

    return res.status(200).json({
      message: 'Connexion réussie.',
      user,
    });
  });
});

// Route pour récupérer tous les cours
app.get('/api/courses', (req, res) => {
  const query = 'SELECT * FROM courses';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    return res.status(200).json(results);
  });
});

// Route pour souscrire à un cours
app.post('/api/course_students', (req, res) => {
  const { course_id, email } = req.body;

  if (!course_id || !email) {
    return res.status(400).json({ message: 'Course ID et email sont requis.' });
  }

  const findStudentQuery = 'SELECT id FROM users WHERE email = ? AND role = "Student"';
  const insertQuery = 'INSERT INTO course_students (course_id, student_id) VALUES (?, ?)';

  db.query(findStudentQuery, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la recherche de l\'étudiant :', err);
      return res.status(500).json({ message: 'Erreur serveur lors de la recherche de l\'étudiant.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Étudiant non trouvé.' });
    }

    const studentId = results[0].id;

    db.query(insertQuery, [course_id, studentId], (err) => {
      if (err) {
        console.error('Erreur lors de l\'inscription au cours :', err);
        return res.status(500).json({ message: 'Erreur serveur lors de l\'inscription au cours.' });
      }

      return res.status(200).json({ message: 'Inscription réussie.' });
    });
  });
});

// Route pour récupérer les cours souscrits par un étudiant
app.get('/api/student/:id/subscribed-courses', (req, res) => {
  const studentId = req.params.id;

  const query = `
    SELECT courses.* 
    FROM courses 
    JOIN course_students ON courses.id = course_students.course_id 
    WHERE course_students.student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours souscrits :', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des cours souscrits.' });
    }

    return res.status(200).json(results);
  });
});

// Route pour supprimer un cours souscrit par un étudiant
app.delete('/api/course_students/:student_id/:course_id', (req, res) => {
  const { student_id, course_id } = req.params;

  if (!student_id || !course_id) {
    return res.status(400).json({ message: 'Student ID et Course ID sont requis.' });
  }

  const deleteQuery = 'DELETE FROM course_students WHERE student_id = ? AND course_id = ?';

  db.query(deleteQuery, [student_id, course_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression du cours souscrit :', err);
      return res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cours ou étudiant non trouvé.' });
    }

    return res.status(200).json({ message: 'Cours souscrit supprimé avec succès.' });
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

// Lancement du serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
