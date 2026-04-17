import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Supports role-based access control
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated()) {
    // Redirect to login with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

/**
 * Admin Route Component
 * Only allows admin users
 */
export const AdminRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Employee Route Component
 * Allows both employee and admin roles for administrative functions
 */
export const EmployeeRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute allowedRoles={['employee', 'admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * User Route Component
 * Allows citizen, employee, and admin roles for standard user pages
 */
export const UserRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute allowedRoles={['citizen', 'employee', 'admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Public Route Component
 * Redirects authenticated users away from auth pages
 */
export const PublicRoute = ({
  children,
  redirectTo = '/dashboard'
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect authenticated users away from login/register pages
  if (isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;