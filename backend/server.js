require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

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

// 1. Inscription d'un utilisateur
app.post('/api/signup', (req, res) => {
  const { email, password, role } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';

  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'email :', err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length > 0) {
      res.status(400).send('This email is already registered.');
      return;
    }

    db.query(insertQuery, [email, password, role], (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
        res.status(500).send('Server error');
        return;
      }

      res.status(201).send('Successful Subscription.');
    });
  });
});

// 2. Connexion d'un utilisateur
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification des informations de connexion :', err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Invalid email or password.');
      return;
    }

    const user = results[0];
    if (user.role !== role) {
      res.status(403).send('Role does not match this email address.');
      return;
    }

    res.status(200).json({ message: 'Login successful!', user });
  });
});

// 3. Récupérer tous les cours
app.get('/api/courses', (req, res) => {
  const query = 'SELECT * FROM courses';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours :', err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results);
  });
});

// 4. Récupérer les cours d'un professeur
app.get('/api/professor/:id/courses', (req, res) => {
  const professorId = parseInt(req.params.id);

  if (!professorId) {
    res.status(400).send('Professor ID is required.');
    return;
  }

  const query = 'SELECT * FROM courses WHERE professor_id = ?';

  db.query(query, [professorId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours :', err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results);
  });
});

// 5. Supprimer un cours
app.delete('/api/courses/:id', (req, res) => {
  const courseId = parseInt(req.params.id);

  if (isNaN(courseId)) {
    res.status(400).send('Invalid course ID.');
    return;
  }

  const query = 'DELETE FROM courses WHERE id = ?';

  db.query(query, [courseId], (err) => {
    if (err) {
      console.error('Erreur lors de la suppression du cours :', err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).send('Course deleted successfully.');
  });
});

// 6. Récupérer les cours disponibles pour un étudiant
app.get('/api/student/:id/available-courses', (req, res) => {
  const query = 'SELECT * FROM courses';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours disponibles :', err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results);
  });
});

// 7. Récupérer les cours souscrits par un étudiant
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
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results);
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).send('Route not found.');
});

// Lancer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
