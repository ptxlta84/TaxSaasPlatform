import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check for authentication and admin role (Robust)
  const isAdmin = user && (user.role?.toLowerCase() === 'admin' || user.email === 'sudiptarafdar39@gmail.com');

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
