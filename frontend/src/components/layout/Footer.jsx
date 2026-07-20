import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(11, 15, 25, 0.9)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: '0.9rem',
      color: '#6b7280',
      width: '100%',
      marginTop: 'auto'
    }}>
      <p>&copy; {new Date().getFullYear()} EduLearn LMS. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
