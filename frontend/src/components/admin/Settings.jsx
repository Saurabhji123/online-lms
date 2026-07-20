import React, { useState, useEffect } from 'react';
import Alert from '../common/Alert';
import { Settings, Save, Shield, HelpCircle, HardDrive } from 'lucide-react';

const AdminSettings = () => {
  const [siteName, setSiteName] = useState('EduLearn LMS Portal');
  const [smtpServer, setSmtpServer] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('2525');
  const [fileLimit, setFileLimit] = useState('100');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [allowCertificates, setAllowCertificates] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    const saved = localStorage.getItem('platform_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSiteName(parsed.siteName || 'EduLearn LMS Portal');
      setSmtpServer(parsed.smtpServer || 'smtp.mailtrap.io');
      setSmtpPort(parsed.smtpPort || '2525');
      setFileLimit(parsed.fileLimit || '100');
      setAllowRegistration(parsed.allowRegistration ?? true);
      setAllowCertificates(parsed.allowCertificates ?? true);
      setMaintenanceMode(parsed.maintenanceMode ?? false);
    }
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const settingsObj = {
      siteName,
      smtpServer,
      smtpPort,
      fileLimit,
      allowRegistration,
      allowCertificates,
      maintenanceMode
    };
    localStorage.setItem('platform_settings', JSON.stringify(settingsObj));
    setAlertType('success');
    setAlertMsg('Settings configuration updated successfully.');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Platform Configurations</h1>
        <p style={{ color: '#9ca3af' }}>Manage SMTP accounts, site branding details, upload limits, and enrollment switches</p>
      </div>

      <Alert message={alertMsg} type={alertType} />

      <div className="glass-card">
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
            <Settings size={18} /> Global Parameters
          </h3>
          
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

          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
            <Shield size={18} /> Feature Toggle Gateways
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Enable Open Registration</h4>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Allow new users to sign up from the Register page.</p>
              </div>
              <input 
                type="checkbox" 
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Allow Certificates Generation</h4>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Allow graduating students to verify and download PDFs.</p>
              </div>
              <input 
                type="checkbox" 
                checked={allowCertificates}
                onChange={(e) => setAllowCertificates(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Under Maintenance Mode</h4>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Block student/instructor access and display a maintenance card.</p>
              </div>
              <input 
                type="checkbox" 
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
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
