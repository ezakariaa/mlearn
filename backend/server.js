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
app.use('/courses', express.static(path.join(__dirname, 'courses')));


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

// Configuration pour le stockage des fichiers courses
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'courses')); // Dossier courses
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const courseUpload = multer({
  storage: courseStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 Mo
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
    }
  },
});


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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});

// Route pour l'inscription d'un nouvel utilisateur
app.post('/api/subscribe', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Vérifiez si l'email existe déjà
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    // Ajoutez l'utilisateur à la base de données
    const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [email, password, role], (err) => {
      if (err) {
        console.error('Error subscribing user:', err);
        return res.status(500).json({ message: 'Server error.' });
      }

      return res.status(201).json({ message: 'User successfully subscribed.' });
    });
  });
});


// Route pour récupérer le profil utilisateur par email
app.get('/api/users/profile', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: 'Email requis pour récupérer le profil utilisateur.' });
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

  const formattedInterests = Array.isArray(interests) ? interests.join(',') : interests;

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
    ? [name, phone, city, country, profile_picture, presentation, formattedInterests, date_of_birth, email]
    : [name, phone, city, country, presentation, formattedInterests, date_of_birth, email];

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

    const insertQuery = `
      INSERT INTO course_students (course_id, student_id, professor)
      VALUES (?, ?, ?)
    `;
    db.query(insertQuery, [course_id, student_id, professor_id], (err) => {
      if (err) {
        console.error('Erreur lors de l\'inscription :', err);
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
    SELECT c.id, c.title, c.description, c.category, c.professor_id, c.location, c.duration, c.course_image
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

// Route pour récupérer les cours d'un professeur avec le nombre d'étudiants inscrits
app.get('/api/professor/:id/courses', (req, res) => {
  const professorId = req.params.id;

  if (!professorId) {
    return res.status(400).json({ message: 'ID du professeur requis.' });
  }

  const query = `
    SELECT 
      c.id, 
      c.title, 
      c.description, 
      c.category, 
      c.location, 
      c.duration, 
      c.course_image, 
      (SELECT COUNT(*) FROM course_students WHERE course_id = c.id) AS studentCount
    FROM courses c
    WHERE c.professor_id = ?
  `;

  db.query(query, [professorId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun cours trouvé pour ce professeur.' });
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

// Route pour ajouter un nouveau cours avec une image
app.post('/api/courses', courseUpload.single('course_image'), (req, res) => {
  const { title, description, category, location, duration, professor_id } = req.body;
  const course_image = req.file ? `/courses/${req.file.filename}` : null; // Stocker le chemin de l'image

  if (!title || !description || !category || !location || !duration || !professor_id) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `
    INSERT INTO courses (title, description, category, location, duration, professor_id, course_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [title, description, category, location, duration, professor_id, course_image], (err, results) => {
    if (err) {
      console.error('Error adding course:', err);
      return res.status(500).json({ message: 'Failed to add the course.' });
    }

    return res.status(201).json({ message: 'Course added successfully.', courseId: results.insertId });
  });
});

// Route pour supprimer un cours
app.delete('/api/courses/:id', (req, res) => {
  const courseId = req.params.id;

  const query = 'DELETE FROM courses WHERE id = ?';
  db.query(query, [courseId], (err, result) => {
    if (err) {
      console.error('Error deleting course:', err);
      return res.status(500).json({ message: 'Failed to delete the course.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.status(200).json({ message: 'Course deleted successfully.' });
  });
});

// Route pour récupérer les détails d'un cours par ID
app.get('/api/courses/:id', (req, res) => {
  const courseId = req.params.id;

  const query = 'SELECT * FROM courses WHERE id = ?';
  db.query(query, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching course details:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.status(200).json(results[0]);
  });
});

// Route pour récupérer les étudiants inscrits à un cours
app.get('/api/course/:id/students', (req, res) => {
  const courseId = req.params.id;

  const query = `
    SELECT s.id, s.name, s.email
    FROM course_students cs
    JOIN users s ON cs.student_id = s.id
    WHERE cs.course_id = ?
  `;

  db.query(query, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    return res.status(200).json(results);
  });
});

// Route pour supprimer un étudiant souscrit à un cours
app.delete('/api/course/:courseId/students/:studentId', (req, res) => {
  const { courseId, studentId } = req.params;

  const deleteQuery = 'DELETE FROM course_students WHERE course_id = ? AND student_id = ?';

  db.query(deleteQuery, [courseId, studentId], (err, results) => {
    if (err) {
      console.error('Error deleting student from course:', err);
      return res.status(500).json({ message: 'Error deleting student from course.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found in the course.' });
    }

    return res.status(200).json({ message: 'Student successfully removed from the course.' });
  });
});

// récupérer les détails du cours par un student :
app.get('/api/courses/:courseId', (req, res) => {
  const courseId = req.params.courseId;

  const query = `
    SELECT c.*, u.name AS professor
    FROM courses c
    JOIN users u ON c.professor_id = u.id
    WHERE c.id = ?
  `;

  db.query(query, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching course details:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.status(200).json(results[0]);
  });
});

// Route pour mettre à jour un cours
app.put('/api/courses/:id', courseUpload.single('course_image'), (req, res) => {
  const courseId = req.params.id;
  const { title, description, category, location, duration } = req.body;
  const course_image = req.file ? `/courses/${req.file.filename}` : null; // Image optionnelle

  if (!title || !description || !category || !location || !duration) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const updateQuery = `
    UPDATE courses
    SET 
      title = ?,
      description = ?,
      category = ?,
      location = ?,
      duration = ?,
      course_image = ?
    WHERE id = ?
  `;

  const values = [title, description, category, location, duration, course_image, courseId];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error('Error updating course:', err);
      return res.status(500).json({ message: 'Failed to update the course.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.status(200).json({ message: 'Course updated successfully.' });
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
