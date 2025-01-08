import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      {/* Navbar toujours visible */}
      <Navbar />

      {/* Contenu principal */}
      <div style={{ marginTop: '70px', minHeight: 'calc(100vh - 120px)' }}>
        {children}
      </div>

      {/* Footer toujours visible */}
      <Footer />
    </div>
  );
};

export default Layout;
