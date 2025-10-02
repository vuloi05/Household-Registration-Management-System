import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@store/hooks/hooks';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;