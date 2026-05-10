import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MaintenancePage from './pages/MaintenancePage';
import DrillsPage from './pages/DrillsPage';
import ShipsPage from './pages/ShipsPage';
import UsersPage from './pages/UsersPage';
import CrewDashboard from './pages/CrewDashboard';
import CrewTasksPage from './pages/CrewTasksPage';
import CrewDrillsPage from './pages/CrewDrillsPage';

// Protected layout wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
};

// Admin-only guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/crew" replace />;
  return <>{children}</>;
};

// Crew-only guard
const CrewRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/crew" replace />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<LoginPage />} />

    {/* Root redirect */}
    <Route path="/" element={<RootRedirect />} />

    {/* Admin routes */}
    <Route path="/dashboard" element={
      <ProtectedLayout><AdminRoute><Dashboard /></AdminRoute></ProtectedLayout>
    } />
    <Route path="/maintenance" element={
      <ProtectedLayout><AdminRoute><MaintenancePage /></AdminRoute></ProtectedLayout>
    } />
    <Route path="/drills" element={
      <ProtectedLayout><AdminRoute><DrillsPage /></AdminRoute></ProtectedLayout>
    } />
    <Route path="/ships" element={
      <ProtectedLayout><AdminRoute><ShipsPage /></AdminRoute></ProtectedLayout>
    } />
    <Route path="/users" element={
      <ProtectedLayout><AdminRoute><UsersPage /></AdminRoute></ProtectedLayout>
    } />

    {/* Crew routes */}
    <Route path="/crew" element={
      <ProtectedLayout><CrewRoute><CrewDashboard /></CrewRoute></ProtectedLayout>
    } />
    <Route path="/crew/tasks" element={
      <ProtectedLayout><CrewRoute><CrewTasksPage /></CrewRoute></ProtectedLayout>
    } />
    <Route path="/crew/drills" element={
      <ProtectedLayout><CrewRoute><CrewDrillsPage /></CrewRoute></ProtectedLayout>
    } />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
