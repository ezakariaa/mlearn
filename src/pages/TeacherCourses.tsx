import React from 'react';
import Layout from '../components/Layout';

const TeacherCourses: React.FC = () => {
  return (
    <Layout>
      <div className="container mt-5">
        <h1>Vos Cours</h1>
        <p>Liste des cours que vous proposez aux étudiants.</p>

        {/* Placeholder pour les cours */}
        <div className="mt-4">
          <ul className="list-group">
            <li className="list-group-item">Cours 1</li>
            <li className="list-group-item">Cours 2</li>
            <li className="list-group-item">Cours 3</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherCourses;
