import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Если пользователь не авторизован перенаправляем на страницу входа
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;