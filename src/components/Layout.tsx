import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/styles.css'; // Unique fichier CSS

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar toujours visible */}
      <Navbar />

      {/* Contenu principal */}
      <main style={{ flex: '1', marginTop: '60px', padding: '20px' }}>
        {children}
      </main>

      {/* Footer toujours visible */}
      <Footer />
    </div>
  );
};

export default Layout;
