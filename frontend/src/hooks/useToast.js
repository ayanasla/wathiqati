import React from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../utils/api.config';

/**
 * Hook for showing toast notifications
 * Provides success, error, warning, and info toasts
 */
export const useToast = () => {
  const showSuccess = (message, metadata = {}) => {
    toast.success(message, {
      duration: 4000,
      ...metadata,
    });
  };

  const showError = (error, metadata = {}) => {
    const message = getErrorMessage(error);
    toast.error(message, {
      duration: 5000,
      ...metadata,
    });
  };

  const showWarning = (message, metadata = {}) => {
    toast.warning(message, {
      duration: 4000,
      ...metadata,
    });
  };

  const showInfo = (message, metadata = {}) => {
    toast.info(message, {
      duration: 3000,
      ...metadata,
    });
  };

  const showLoading = (message) => {
    return toast.loading(message, { duration: Infinity });
  };

  const updateToast = (toastId, message, type = 'default') => {
    toast[type](message, { id: toastId });
  };

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    update: updateToast,
    promise: toast.promise,
  };
};

/**
 * Hook for handling async operations with loading state and error handling
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = React.useState('idle');
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};
