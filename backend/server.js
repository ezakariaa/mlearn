require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration pour servir les fichiers statiques
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

// Configuration pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'avatars'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mlearn',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

// Route pour connecter les utilisateurs
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

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
      return res.status(403).json({ message: 'Choisissez le bon profil.' });
    }

    return res.status(200).json({
      message: 'Connexion réussie.',
      user,
    });
  });
});

// Route pour récupérer le profil utilisateur par email
app.get('/api/users/profile', (req, res) => {
  const email = req.query.email;

  if (!email) {
    console.log('Email manquant pour le profil utilisateur.');
    return res.status(400).json({ message: 'Email requis pour récupérer le profil utilisateur.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du profil utilisateur :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      console.log('Aucun utilisateur trouvé avec cet email :', email);
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    return res.status(200).json(results[0]);
  });
});

// Route pour mettre à jour le profil utilisateur
app.put('/api/users/update', upload.single('profile_picture'), (req, res) => {
  const { name, email, phone, city, country, presentation, interests, date_of_birth } = req.body;
  const profile_picture = req.file ? `/avatars/${req.file.filename}` : null;

  if (!email) {
    return res.status(400).json({ message: 'Email est requis.' });
  }

  const updateQuery = `
    UPDATE users
    SET 
      name = ?, 
      phone = ?, 
      city = ?, 
      country = ?, 
      ${profile_picture ? 'profile_picture = ?,' : ''} 
      presentation = ?, 
      interests = ?, 
      date_of_birth = ?
    WHERE email = ?
  `;

  const values = profile_picture
    ? [name, phone, city, country, profile_picture, presentation, interests, date_of_birth, email]
    : [name, phone, city, country, presentation, interests, date_of_birth, email];

  db.query(updateQuery, values, (err) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du profil utilisateur :', err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
    }

    return res.status(200).json({ message: 'Profil mis à jour avec succès.' });
  });
});

// Route pour souscrire à un cours
app.post('/api/course_students', (req, res) => {
  const { course_id, student_id } = req.body;

  if (!course_id || !student_id) {
    return res.status(400).json({ message: 'course_id et student_id sont requis.' });
  }

  // Récupération du professor_id pour le cours
  const getCourseQuery = 'SELECT professor_id FROM courses WHERE id = ?';
  db.query(getCourseQuery, [course_id], (err, courseResults) => {
    if (err) {
      console.error('Erreur lors de la récupération du cours :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (courseResults.length === 0) {
      return res.status(400).json({ message: 'course_id invalide : ce cours n\'existe pas.' });
    }

    const professor_id = courseResults[0].professor_id;

    // Insertion dans course_students
    const insertQuery = `
      INSERT INTO course_students (course_id, student_id, professor)
      VALUES (?, ?, ?)
    `;
    db.query(insertQuery, [course_id, student_id, professor_id], (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion dans course_students :', err);
        return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
      }

      return res.status(201).json({ message: 'Inscription réussie.' });
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

// Route pour récupérer les cours souscrits par un étudiant
app.get('/api/student/:id/subscribed-courses', (req, res) => {
  const studentId = req.params.id;

  if (!studentId) {
    return res.status(400).json({ message: 'ID de l\'étudiant requis.' });
  }

  const query = `
    SELECT c.id, c.title, c.description, c.category, c.professor_id, c.location, c.duration
    FROM course_students sc
    JOIN courses c ON sc.course_id = c.id
    WHERE sc.student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours souscrits :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    return res.status(200).json(results);
  });
});

// Route pour supprimer une inscription à un cours
app.delete('/api/course_students/:student_id/:course_id', (req, res) => {
  const { student_id, course_id } = req.params;

  if (!student_id || !course_id) {
    return res.status(400).json({ message: 'student_id et course_id sont requis.' });
  }

  const deleteQuery = 'DELETE FROM course_students WHERE student_id = ? AND course_id = ?';

  db.query(deleteQuery, [student_id, course_id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'inscription :', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Inscription introuvable.' });
    }

    return res.status(200).json({ message: 'Inscription supprimée avec succès.' });
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
