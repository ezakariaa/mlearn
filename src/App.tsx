import React from 'react';
import './styles/styles.css';
import Home from './Home';
import Professor from './Professor';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route pour la page d'accueil */}
        <Route path="/" element={<Home />} />

        {/* Route pour la page professeur */}
        <Route path="/professor" element={<Professor />} />
      </Routes>
    </Router>
  );
};

export default App;
