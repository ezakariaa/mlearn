const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Configuration MySQL
const multer = require('multer');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint pour enregistrer un utilisateur
app.post('/register', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà enregistré.' });
    }

    const insertUserQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [email, password, role], (err) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      res.status(200).json({ message: 'Utilisateur enregistré avec succès.' });
    });
  });
});

// Endpoint pour la connexion
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  const loginQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(loginQuery, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const user = results[0];
    res.status(200).json({ message: 'Connexion réussie.', user });
  });
});

// Endpoint pour mettre à jour le profil
app.put('/update-profile', (req, res) => {
  const { email, name, phone, city, country, newPassword, profilePicture } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email requis pour mettre à jour le profil.' });
  }

  const query = `UPDATE users SET name = ?, phone = ?, city = ?, country = ?, profile_picture = ? ${
    newPassword ? ', password = ?' : ''
  } WHERE email = ?`;

  const values = newPassword
    ? [name, phone, city, country, profilePicture, newPassword, email]
    : [name, phone, city, country, profilePicture, email];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });

    res.status(200).json({ message: 'Profil mis à jour avec succès.' });
  });
});

// Endpoint pour récupérer les cours
app.get('/courses', (req, res) => {
    const { professor_id } = req.query;
  
    if (!professor_id) {
      return res.status(400).json({ message: "L'ID du professeur est requis." });
    }
  
    const query = 'SELECT * FROM courses WHERE professor_id = ?';
    db.query(query, [professor_id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des cours:', err.message);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }
  
      res.status(200).json({ courses: results });
    });
  });
  

// Endpoint pour récupérer les cours souscrits par un étudiant
app.get('/student-courses', (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: 'ID de l\'étudiant requis.' });
  }

  const query = `
    SELECT c.* 
    FROM courses c
    JOIN course_students cs ON c.id = cs.course_id
    WHERE cs.student_id = ?
  `;
  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });

    res.status(200).json({ courses: results });
  });
});

// Gestion des routes non définies
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

// Démarrage du serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

// Configurer le stockage des fichiers avec multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  const upload = multer({ storage });
  
  // Endpoint pour ajouter un cours
  app.post('/add-course', upload.single('image'), (req, res) => {
    const { title, description, category, location, professorId } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
    const query = `
      INSERT INTO courses (title, description, category, location, professor_id, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [title, description, category, location, professorId, imagePath], (err) => {
      if (err) {
        console.error('Erreur lors de l\'ajout du cours:', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }
      res.status(200).json({ message: 'Cours ajouté avec succès.' });
    });
  });