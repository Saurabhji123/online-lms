import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiCall from '../services/api';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { CheckCircle, AlertTriangle, ShieldCheck, Download, Award } from 'lucide-react';

const VerifyCertificate = () => {
  const { certId } = useParams();
  const [inputVal, setInputVal] = useState(certId || '');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (certId) {
      handleVerify(certId);
    }
  }, [certId]);

  const handleVerify = async (idToVerify) => {
    const targetId = idToVerify || inputVal;
    if (!targetId.trim()) {
      setErrorMsg('Please enter a valid credential ID.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setCertData(null);

    const res = await apiCall(`/certificates/verify/${targetId.trim()}`);
    setLoading(false);

    if (res.success && res.data) {
      setCertData(res.data);
    } else {
      setErrorMsg(res.error || 'No verified credential matches that ID. Please check the spelling.');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div style={{ maxWidth: '650px', margin: '4rem auto', padding: '1rem' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Award size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #f9fafb, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Credential Authentication
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Verify the validity and accreditation status of digital certificates issued by EduLearn.
        </p>
      </div>

      {/* Input query form */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label>Accredited Credential ID</label>
            <input 
              type="text" 
              placeholder="e.g. CERT-A1B2-C3D4-5678"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="glass-input"
              style={{ textTransform: 'uppercase' }}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', height: '42px', display: 'flex', alignItems: 'center' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {errorMsg && <Alert message={errorMsg} type="error" />}
      {loading && <Loader />}

      {/* Verification Card output */}
      {certData && (
        <div 
          className="glass-card" 
          style={{ 
            border: '2px solid rgba(16, 185, 129, 0.25)', 
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)',
            padding: '2rem',
            borderRadius: '16px',
            animation: 'verifyScaleUp 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Header check status banner */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <ShieldCheck size={32} color="#10b981" />
            <div>
              <h4 style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Accredited Credential Verified
              </h4>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
                This certificate is authentic and recorded in EduLearn\'s secure ledger database.
              </p>
            </div>
          </div>

          {/* Certificate metadata key-value table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Recipient Graduate</span>
              <strong style={{ color: '#f9fafb', fontSize: '0.9rem' }}>{certData.studentName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Accredited Program</span>
              <strong style={{ color: '#6366f1', fontSize: '0.9rem' }}>{certData.courseTitle}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Credential Code</span>
              <strong style={{ color: '#fbbf24', fontSize: '0.9rem', fontFamily: 'monospace' }}>{certData.certificateId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Issue Timestamp</span>
              <strong style={{ color: '#f9fafb', fontSize: '0.9rem' }}>{new Date(certData.issuedAt).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* Download trigger */}
          <a 
            href={`/uploads/certificates/cert-${certData.certificateId}.pdf`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}
          >
            <Download size={18} /> Download Accredited PDF Document
          </a>
        </div>
      )}

      <style>{`
        @keyframes verifyScaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VerifyCertificate;
