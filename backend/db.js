const mysql = require('mysql2');

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Votre utilisateur MySQL
  password: '', // Votre mot de passe MySQL
  database: 'MLEARN', // Nom de la base de données
});

// Connecter à MySQL
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL:', err.message);
  } else {
    console.log('Connecté à la base de données MySQL.');
  }
});

module.exports = db;
