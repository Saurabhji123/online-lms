import React, { useState } from 'react';
import Alert from '../common/Alert';
import { Settings, Save } from 'lucide-react';

const AdminSettings = () => {
  const [siteName, setSiteName] = useState('EduLearn LMS Portal');
  const [smtpServer, setSmtpServer] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('2525');
  const [fileLimit, setFileLimit] = useState('100');
  
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setAlertType('success');
    setAlertMsg('Settings configuration updated successfully.');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Platform Configurations</h1>
        <p style={{ color: '#9ca3af' }}>Manage SMTP accounts, site branding details, and upload limits</p>
      </div>

      <Alert message={alertMsg} type={alertType} />

      <div className="glass-card">
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}><Settings size={18} /> Global Parameters</h3>
          
          <div className="form-group">
            <label>Site Branding Name</label>
            <input 
              type="text" 
              value={siteName} 
              onChange={(e) => setSiteName(e.target.value)} 
              className="glass-input" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>SMTP Host</label>
              <input 
                type="text" 
                value={smtpServer} 
                onChange={(e) => setSmtpServer(e.target.value)} 
                className="glass-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label>SMTP Port</label>
              <input 
                type="text" 
                value={smtpPort} 
                onChange={(e) => setSmtpPort(e.target.value)} 
                className="glass-input" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Max Video/File Upload Size Limit (MB)</label>
            <input 
              type="number" 
              value={fileLimit} 
              onChange={(e) => setFileLimit(e.target.value)} 
              className="glass-input" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <Save size={16} /> Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
