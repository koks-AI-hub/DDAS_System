import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, user }) => {
  if (user === null) {
    // Return loading state or nothing while checking session
    return null;
  }
  
  if (user === false) {
    // Unauthenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;
