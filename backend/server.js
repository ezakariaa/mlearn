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

// Vérifier la connexion
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

// Route API pour l'inscription
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

// Route API pour la connexion
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

// Route API pour récupérer les cours d'un professeur
app.get('/api/professor/:id/courses', (req, res) => {
  const professorId = req.params.id;

  // Valider si un ID est passé
  if (!professorId) {
    return res.status(400).send('Professor ID is required.');
  }

  const query = 'SELECT * FROM courses WHERE professor_id = ?';

  db.query(query, [professorId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours :', err);
      return res.status(500).send('Server error');
    }

    res.status(200).json(results);
  });
});


// Route API pour supprimer un cours
app.delete('/api/courses/:id', (req, res) => {
  const courseId = parseInt(req.params.id, 10);

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

// Exemple d'API : Récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
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
