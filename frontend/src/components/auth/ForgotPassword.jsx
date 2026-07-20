import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import apiCall from '../../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (!email) {
      setAlertMsg('Please fill in email');
      return;
    }

    setLoading(true);
    const res = await apiCall('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    setLoading(false);
    if (res.success) {
      setAlertType('success');
      setAlertMsg('Reset link sent! Please check your email inbox (and developer console logs).');
    } else {
      setAlertMsg(res.error || 'Request failed.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, #6366f1, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Reset Password</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.25rem' }}>Enter your email to receive a recovery link</p>
        </div>

        <Alert message={alertMsg} type={alertType} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {loading ? (
            <Loader size={30} />
          ) : (
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
              Send Reset Link
            </button>
          )}
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
