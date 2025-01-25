import React from 'react';
import './styles/styles.css';
import Home from './Home';
import ProfessorProfile from './ProfessorProfile';
import Professor from './ProfessorCourses';
import StudentProfile from './StudentProfile';
import Student from './StudentCourses';
import CourseStudents from './CourseStudents';
import Course from './Course';
import EditProfile from './EditProfile'; // Importation de la page EditProfile
import AddCourse from './AddCourse'; // Importation de la page AddCourse
import EditCourse from './EditCourse'; // Importation de la page EditCourse

import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const App: React.FC = () => {
  // Gestion de l'affichage conditionnel de la Navbar
  const WrapperWithNavbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
      <>
        {/* Affiche la Navbar uniquement si ce n'est pas la page Home */}
        {!isHomePage && <Navbar />}
        {children}
      </>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Route pour la page Home (sans Navbar) */}
        <Route path="/" element={<Home />} />

        {/* Routes pour Student */}
        <Route
          path="/student-profile"
          element={
            <WrapperWithNavbar>
              <StudentProfile />
            </WrapperWithNavbar>
          }
        />
        <Route
          path="/student-courses"
          element={
            <WrapperWithNavbar>
              <Student />
            </WrapperWithNavbar>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <WrapperWithNavbar>
              <EditProfile />
            </WrapperWithNavbar>
          }
        />

        {/* Routes pour Professor */}
        <Route
          path="/professor-profile"
          element={
            <WrapperWithNavbar>
              <ProfessorProfile />
            </WrapperWithNavbar>
          }
        />
        <Route
          path="/professor-courses"
          element={
            <WrapperWithNavbar>
              <Professor />
            </WrapperWithNavbar>
          }
        />
        <Route
          path="/add-course"
          element={
            <WrapperWithNavbar>
              <AddCourse />
            </WrapperWithNavbar>
          }
        />
        {/* Nouvelle route pour EditCourse */}
        <Route
          path="/edit-course/:courseId"
          element={
            <WrapperWithNavbar>
              <EditCourse />
            </WrapperWithNavbar>
          }
        />

        {/* Routes pour les cours */}
        <Route
          path="/course/:courseId/students"
          element={
            <WrapperWithNavbar>
              <CourseStudents />
            </WrapperWithNavbar>
          }
        />
        <Route
          path="/student-course/:courseId"
          element={
            <WrapperWithNavbar>
              <Course />
            </WrapperWithNavbar>
          }
        />
        <Route
          path="/course/:courseId"
          element={
            <WrapperWithNavbar>
              <Course />
            </WrapperWithNavbar>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
