import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, onAuthStateChange } from './services/authService';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

import InstitutionSelection from './pages/InstitutionSelection';
import RegisterInstitution from './pages/RegisterInstitution';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadDataset from './pages/UploadDataset';
import Repository from './pages/Repository';
import DownloadLogs from './pages/DownloadLogs';
import EnergyAnalytics from './pages/EnergyAnalytics';
import ManageUsers from './pages/ManageUsers';

function App() {
  const [user, setUser] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);
  const [globalInstitution, setGlobalInstitution] = useState(null);

  useEffect(() => {
    // Check active session
    getCurrentUser().then(currentUser => {
      setUser(currentUser || false); // false = unauthenticated
      if (currentUser?.profile?.institutions) {
        setGlobalInstitution(currentUser.profile.institutions);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setUser(false);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser?.profile?.institutions) {
          setGlobalInstitution(currentUser.profile.institutions);
        }
      } else {
        setUser(false);
        setGlobalInstitution(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Admin Route Wrapper
  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <InstitutionSelection setGlobalInstitution={setGlobalInstitution} />
          } />
          <Route path="/register-institution" element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterInstitution setGlobalInstitution={setGlobalInstitution} />
          } />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login globalInstitution={globalInstitution} />
          } />
          
          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute user={user}><UploadDataset user={user} /></PrivateRoute>} />
          <Route path="/repository" element={<PrivateRoute user={user}><Repository user={user} /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute user={user}><DownloadLogs /></PrivateRoute>} />
          <Route path="/energy" element={<PrivateRoute user={user}><EnergyAnalytics /></PrivateRoute>} />
          
          <Route path="/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
