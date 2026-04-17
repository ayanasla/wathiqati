import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './components/LanguageContext';
import ProtectedRoute, { AdminRoute, UserRoute, PublicRoute, EmployeeRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './Layout';
import Home from './pages/Home';
import NewRequest from './pages/NewRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateRequest from './pages/AdminCreateRequest';
import AdminRequestDetail from './pages/AdminRequestDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Redirect authenticated users */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected User Routes - Allow citizen, employee, and admin */}
      <Route
        path="/"
        element={
          <UserRoute>
            <Layout currentPageName="Home">
              <Home />
            </Layout>
          </UserRoute>
        }
      />

      <Route
        path="/new-request"
        element={
          <UserRoute>
            <Layout currentPageName="NewRequest">
              <NewRequest />
            </Layout>
          </UserRoute>
        }
      />

      <Route
        path="/my-requests"
        element={
          <UserRoute>
            <Layout currentPageName="MyRequests">
              <MyRequests />
            </Layout>
          </UserRoute>
        }
      />

      <Route
        path="/request-details/:id"
        element={
          <UserRoute>
            <Layout currentPageName="RequestDetails">
              <RequestDetails />
            </Layout>
          </UserRoute>
        }
      />

      {/* Admin/Employee Routes */}
      <Route
        path="/admin"
        element={
          <EmployeeRoute>
            <Layout currentPageName="AdminDashboard">
              <AdminDashboard />
            </Layout>
          </EmployeeRoute>
        }
      />

      <Route
        path="/admin/request/:id"
        element={
          <EmployeeRoute>
            <Layout currentPageName="AdminDashboard">
              <AdminRequestDetail />
            </Layout>
          </EmployeeRoute>
        }
      />

      <Route
        path="/admin/create-request"
        element={
          <EmployeeRoute>
            <Layout currentPageName="AdminCreateRequest">
              <AdminCreateRequest />
            </Layout>
          </EmployeeRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <LanguageProvider>
            <AppRoutes />
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              theme="light"
              toastOptions={{
                classNames: {
                  toast: 'gap-3',
                  title: 'font-semibold',
                  description: 'text-sm',
                },
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
