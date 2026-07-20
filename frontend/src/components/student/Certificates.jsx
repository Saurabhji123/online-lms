import React, { useEffect, useState } from 'react';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { Award, Download, Calendar } from 'lucide-react';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    const res = await apiCall('/certificates/me');
    if (res.success) {
      setCertificates(res.data);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>My Credentials</h1>
        <p style={{ color: '#9ca3af' }}>View and download your accredited certificates</p>
      </div>

      <div className="grid-3">
        {certificates.map((cert) => (
          <div key={cert._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.03)', borderRadius: '12px', border: '1px dashed rgba(245,158,11,0.1)' }}>
              <Award size={48} color="#fbbf24" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{cert.courseId?.title}</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} /> Issued on: {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>ID: {cert.certificateId}</p>
            </div>

            <a 
              href={cert.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-accent" 
              style={{ display: 'flex', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}
            >
              <Download size={16} /> Download PDF
            </a>
          </div>
        ))}

        {certificates.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <Award size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p>You haven't earned any certificates yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Complete 100% of a course's curriculum to trigger credentials.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
