// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer_class">
      <hr />
      <p>&copy; {new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
    </footer>
  );
};

export default Footer;