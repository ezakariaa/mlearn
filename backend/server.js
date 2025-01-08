const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Importer la configuration MySQL

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint pour enregistrer un utilisateur
app.post('/register', (req, res) => {
  const { email, password, role } = req.body;

  // Vérification des champs obligatoires
  if (!email || !password || !role) {
    console.log('Champs manquants lors de l\'inscription.');
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  // Vérifier si l'utilisateur existe déjà
  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', err.message);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length > 0) {
      console.log(`Email déjà enregistré : ${email}`);
      return res.status(400).json({ message: 'Cet email est déjà enregistré.' });
    }

    // Ajouter l'utilisateur à la base de données
    const insertUserQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [email, password, role], (err) => {
      if (err) {
        console.error('Erreur lors de l\'enregistrement:', err.message);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }
      console.log(`Utilisateur enregistré avec succès : ${email}`);
      res.status(200).json({ message: 'Utilisateur enregistré avec succès.' });
    });
  });
});

// Endpoint pour la connexion
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Vérification des champs obligatoires
  if (!email || !password) {
    console.log('Email ou mot de passe manquant lors de la connexion.');
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  // Vérification des informations dans la base de données
  const loginQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(loginQuery, [email, password], (err, results) => {
    if (err) {
      console.error('Erreur lors de la connexion:', err.message);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      console.log(`Identifiants incorrects : ${email}`);
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const user = results[0];
    console.log(`Connexion réussie pour : ${email}`);
    res.status(200).json({ message: 'Connexion réussie.', user });
  });
});

// Endpoint pour mettre à jour le profil
app.put('/update-profile', (req, res) => {
  const { email, name, phone, city, country, newPassword, profilePicture } = req.body;

  // Vérification de l'email
  if (!email) {
    console.log('Email requis pour mettre à jour le profil.');
    return res.status(400).json({ message: 'Email requis pour mettre à jour le profil.' });
  }

  // Préparer la requête SQL pour la mise à jour
  const updateProfileQuery = `UPDATE users 
    SET name = ?, phone = ?, city = ?, country = ?, profile_picture = ? ${
      newPassword ? ', password = ?' : ''
    } WHERE email = ?`;

  const values = newPassword
    ? [name, phone, city, country, profilePicture, newPassword, email]
    : [name, phone, city, country, profilePicture, email];

  db.query(updateProfileQuery, values, (err) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du profil:', err.message);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
    console.log(`Profil mis à jour avec succès pour : ${email}`);
    res.status(200).json({ message: 'Profil mis à jour avec succès.' });
  });
});

// Gestion des routes non définies
app.use((req, res) => {
  console.log(`Route introuvable : ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route introuvable.' });
});

// Lancer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});