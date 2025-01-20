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

// Configuration pour servir les fichiers statiques
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

// Vérification du chemin d'accès
console.log('Serving avatars from:', path.join(__dirname, 'avatars'));

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
      console.error("Erreur lors de la vérification de l'email :", err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà enregistré.' });
    }

    db.query(insertQuery, [email, password, role], (err) => {
      if (err) {
        console.error("Erreur lors de l'inscription de l'utilisateur :", err);
        return res.status(500).json({ message: 'Erreur serveur.' });
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

// Route pour récupérer le rôle utilisateur par email
app.get('/api/users/role', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: 'Email requis.' });
  }

  const query = 'SELECT role FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du rôle :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    return res.status(200).json({ role: results[0].role });
  });
});

// Route pour récupérer le profil utilisateur par email
app.get('/api/users/profile', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: 'Email requis.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du profil utilisateur :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
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
    SET name = ?, phone = ?, city = ?, country = ?, profile_picture = ?, presentation = ?, interests = ?, date_of_birth = ?
    WHERE email = ?
  `;

  db.query(
    updateQuery,
    [name, phone, city, country, profile_picture, presentation, interests, date_of_birth, email],
    (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du profil utilisateur :', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      return res.status(200).json({ message: 'Profil mis à jour avec succès.' });
    }
  );
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

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
