import React from 'react';

const Loader = ({ size = 40 }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      width: '100%'
    }}>
      <div className="spinner" style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '3px solid rgba(99, 102, 241, 0.1)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
