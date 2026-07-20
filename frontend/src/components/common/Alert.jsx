import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const Alert = ({ message, type = 'error' }) => {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', icon: <CheckCircle size={18} /> };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24', icon: <AlertCircle size={18} /> };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', icon: <Info size={18} /> };
      default: // error
        return { bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', icon: <AlertCircle size={18} /> };
    }
  };

  const style = getStyle();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 1.25rem',
      borderRadius: '12px',
      backgroundColor: style.bg,
      border: style.border,
      color: style.color,
      fontSize: '0.9rem',
      fontWeight: 500,
      marginBottom: '1rem',
      width: '100%'
    }}>
      {style.icon}
      <span>{message}</span>
    </div>
  );
};

export default Alert;
