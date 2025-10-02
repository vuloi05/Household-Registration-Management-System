import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '@layouts/MainLayout/MainLayout';
import AuthLayout from '@layouts/AuthLayout/AuthLayout';
import PrivateRoute from './PrivateRoute';

// Lazy load pages
const Login = lazy(() => import('@pages/Login'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const HouseholdManagement = lazy(() => import('@pages/HouseholdManagement'));
const ResidentManagement = lazy(() => import('@pages/ResidentManagement'));
const FeeManagement = lazy(() => import('@pages/FeeManagement'));
const Statistics = lazy(() => import('@pages/Statistics'));
const NotFound = lazy(() => import('@pages/NotFound'));

const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/households/*" element={<HouseholdManagement />} />
            <Route path="/residents/*" element={<ResidentManagement />} />
            <Route path="/fees/*" element={<FeeManagement />} />
            <Route path="/statistics" element={<Statistics />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;