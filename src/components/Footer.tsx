import React from 'react';
import '../styles/styles.css'; // Unique fichier CSS

const Footer: React.FC = () => {
  return (
    <footer className="footer fixed-bottom">
      <div className="container text-center">
        © 2025 Zakaria ELORCHE & Badr Toumani - ALX
      </div>
    </footer>
  );
};

export default Footer;