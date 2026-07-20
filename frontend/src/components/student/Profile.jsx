import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { User, Phone, BookOpen, Key, FilePlus } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [photo, setPhoto] = useState(null);
  
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setSkills(user.skills ? user.skills.join(', ') : '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('bio', bio);
    formData.append('skills', skills);
    if (photo) {
      formData.append('photo', photo);
    }

    const res = await updateProfile(formData);
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Profile updated successfully!');
    } else {
      setAlertMsg(res.error || 'Update failed.');
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>My Profile Details</h1>
        <p style={{ color: '#9ca3af' }}>Manage your identity and credentials on EduLearn portal</p>
      </div>

      <Alert message={alertMsg} type={alertType} />

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        
        {/* Profile Card Summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.1)',
            border: '2px solid rgba(99,102,241,0.4)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user?.photo ? (
              <img src={user.photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={48} color="#6366f1" />
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem' }}>{user?.name}</h3>
            <p style={{ textTransform: 'capitalize', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>{user?.role}</p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>{user?.email}</p>
          </div>

          {user?.bio && (
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', width: '100%' }}>
              "{user.bio}"
            </p>
          )}

          {user?.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', width: '100%' }}>
              {user.skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="glass-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Edit Profile Information</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="form-group">
              <label>Biography / Summary</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="form-group">
              <label>Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="JavaScript, React, Node.js"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <input
                type="file"
                onChange={(e) => setPhoto(e.target.files[0])}
                style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem' }}
              />
            </div>

            {loading ? (
              <Loader size={30} />
            ) : (
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                Save Changes
              </button>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
