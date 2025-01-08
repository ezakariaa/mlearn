import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import StudentProfile from './pages/StudentProfile';
import StudentCourses from './pages/StudentCourses';
import TeacherProfile from './pages/TeacherProfile';
import TeacherCourses from './pages/TeacherCourses';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/students/profile" element={<Layout><StudentProfile /></Layout>} />
        <Route path="/students/courses" element={<Layout><StudentCourses /></Layout>} />
        <Route path="/teachers" element={<Layout><Teachers /></Layout>} />
        <Route path="/teachers/profile" element={<Layout><TeacherProfile /></Layout>} />
        <Route path="/teachers/courses" element={<Layout><TeacherCourses /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
