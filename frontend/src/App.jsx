import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';
import { initiateSocketConnection, disconnectSocket } from './services/socket';
import { Bell } from 'lucide-react';

const LayoutWrapper = () => {
  const { user } = useContext(AuthContext);
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    if (user) {
      const socket = initiateSocketConnection();
      
      socket.on('newNotification', (data) => {
        // Show slide-out toast popout to all active users
        setActiveToast(data);
        
        // Auto close after 5 seconds
        setTimeout(() => {
          setActiveToast(null);
        }, 5000);
      });

      return () => {
        socket.off('newNotification');
        disconnectSocket();
      };
    }
  }, [user]);

  return (
    <div className="app-container">
      {user && <Sidebar />}
      <div className={`main-content ${user ? 'sidebar-active' : ''}`}>
        <Navbar />
        <main className="content-body">
          <AppRoutes />
        </main>
        <Footer />
      </div>

      {/* Slide-out Global Notification Toast */}
      {activeToast && (
        <div className="notification-toast">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '0.5rem', borderRadius: '50%' }}>
              <Bell size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>
                {activeToast.title}
              </h4>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.2' }}>
                {activeToast.message}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <LayoutWrapper />
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
