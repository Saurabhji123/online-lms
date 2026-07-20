import React, { useEffect, useState } from 'react';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { UserCheck, ShieldAlert, Trash2, ShieldCheck } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiCall('/users');
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId, role) => {
    setAlertMsg('');
    const res = await apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });

    if (res.success) {
      setAlertType('success');
      setAlertMsg(`User role updated successfully!`);
      setUsers(users.map(u => u._id === userId ? { ...u, role } : u));
    } else {
      setAlertMsg(res.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setAlertMsg('');

    const res = await apiCall(`/users/${userId}`, {
      method: 'DELETE'
    });

    if (res.success) {
      setAlertType('success');
      setAlertMsg('User deleted successfully.');
      setUsers(users.filter(u => u._id !== userId));
    } else {
      setAlertMsg(res.error || 'Failed to delete user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>User Directory Registry</h1>
        <p style={{ color: '#9ca3af' }}>View registered user details, promote roles, and delete accounts</p>
      </div>

      <Alert message={alertMsg} type={alertType} />

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Email Address</th>
              <th style={{ padding: '0.75rem' }}>Active Role</th>
              <th style={{ padding: '0.75rem' }}>Verified</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.75rem', color: 'white', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '0.75rem', color: '#9ca3af' }}>{u.email}</td>
                <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                    className="glass-input"
                    style={{ width: '120px', padding: '0.3rem 0.5rem', fontSize: '0.8rem', background: '#111827' }}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {u.isVerified ? (
                    <span style={{ color: '#10b981', display: 'flex', gap: '0.25rem', alignItems: 'center' }}><ShieldCheck size={14} /> Yes</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>No</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDeleteUser(u._id)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
