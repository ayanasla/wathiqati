import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api.client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid by fetching user profile
          try {
            const response = await api.getMe();
            
            // Handle both response formats
            let userData = response;
            if (response && typeof response === 'object') {
              // If response has a user property, extract it
              if (response.user && !response.id) {
                userData = response.user;
              }
            }
            
            if (userData && userData.id) {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              // Token invalid, clear storage
              logout();
            }
          } catch (profileErr) {
            console.warn('Token validation request failed:', profileErr);
            // Token might be expired, clear and let user log in again
            logout();
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();

    // Listen for token expiration event from API
    const handleTokenExpired = () => {
      logout();
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:expired', handleTokenExpired);
    return () => window.removeEventListener('auth:expired', handleTokenExpired);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.login(email, password);

      // Handle response structure
      let tokenData = null;
      let userData = null;

      if (response?.token) {
        tokenData = response.token;
        userData = response.user || {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role
        };
      }

      if (tokenData && userData) {
        setToken(tokenData);
        setUser(userData);

        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true };
      } else {
        const errorMsg = response?.message || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      console.error('Login error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.register(userData);

      if (response?.token && response?.user) {
        setToken(response.token);
        setUser(response.user);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return { success: true };
      } else {
        const errorMsg = response?.message || 'Registration failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.updateProfile(profileData);

      let updatedUser = response;
      if (response?.user) {
        updatedUser = response.user;
      }

      if (updatedUser?.id) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        const errorMsg = response?.message || 'Profile update failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setError(null);
      await api.changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Authentication status methods
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Role-based access control methods
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isCitizen = () => {
    return hasRole('citizen');
  };

  const isEmployee = () => {
    return hasRole('employee');
  };

  const isUser = () => {
    return isCitizen() || isEmployee();
  };

  // Check if user can access admin features
  const canAccessAdmin = () => {
    return isAuthenticated() && isAdmin();
  };

  // Check if user can access user features
  const canAccessUser = () => {
    return isAuthenticated() && (isUser() || isAdmin());
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    hasRole,
    isAdmin,
    isCitizen,
    isEmployee,
    isUser,
    canAccessAdmin,
    canAccessUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
