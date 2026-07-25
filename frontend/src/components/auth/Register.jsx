import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { Mail, Lock, User, ShieldAlert, Phone } from 'lucide-react';

const Register = () => {
  const { register, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (!name || !email || !password) {
      setAlertMsg('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setAlertMsg('Password must be at least 6 characters');
      return;
    }

    const res = await register({ name, email, password, role });
    if (res.success) {
      setAlertType('success');
      setAlertMsg('Registration successful! Verification email sent (check terminal console logs). Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setAlertMsg(res.error || 'Registration failed.');
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
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, #6366f1, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Create Account</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.25rem' }}>Join EduLearn LMS and start your journey</p>
        </div>

        <Alert message={alertMsg} type={alertType} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} color="#6b7280" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password (Min. 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Select Role</label>
            <div style={{ position: 'relative' }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '2.5rem', background: '#111827' }}
              >
                <option value="student">Student (Learn courses & submit tasks)</option>
                <option value="evaluator">Evaluator (Check courses & grade submissions)</option>
                <option value="admin">Admin (Platform Administrator)</option>
              </select>
              <ShieldAlert size={18} color="#6b7280" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {loading ? (
            <Loader size={30} />
          ) : (
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
              Create Account
            </button>
          )}
        </form>

        <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
