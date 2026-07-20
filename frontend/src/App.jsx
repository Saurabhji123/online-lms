import React, { useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';

const LayoutWrapper = () => {
  const { user } = useContext(AuthContext);

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
