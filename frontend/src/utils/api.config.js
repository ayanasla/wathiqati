/**
 * API Configuration & Normalization Layer
 * Handles:
 * - Response normalization (snake_case → camelCase)
 * - Request deduplication
 * - Error handling with retry logic
 * - Token expiration & refresh
 */

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

console.log('API Config - BASE_URL:', BASE_URL);
console.log('API Config - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Request deduplication cache
const pendingRequests = new Map();

/**
 * Normalize API responses from snake_case to camelCase
 */
export function normalizeResponse(data) {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(normalizeResponse);
  
  if (typeof data !== 'object') return data;
  
  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[camelKey] = Array.isArray(value) ? value.map(normalizeResponse) : value;
  }
  return normalized;
}

/**
 * Create request deduplication key
 */
function getRequestKey(url, method = 'GET', body = null) {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${method}:${url}:${bodyStr}`;
}

/**
 * Make API request with deduplication, retry logic, and normalization
 */
export async function apiRequest(url, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    skipAuth = false,
    retries = 3,
    timeout = 30000,
    skipDedup = false,
  } = options;

  // Get token from localStorage
  const token = !skipAuth ? localStorage.getItem('token') : null;

  // Request deduplication: return cached pending request if exists
  if (method === 'GET' && !skipDedup) {
    const key = getRequestKey(url, method, body);
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
  }

  // Build request options
  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  fetchOptions.signal = controller.signal;

  console.log('API Request:', {
    url: `${BASE_URL}${url}`,
    method,
    body: body ? JSON.stringify(body) : null,
    skipAuth,
    hasToken: !!token
  });

  // Create promise for deduplication cache
  const requestPromise = (async () => {
    let lastError;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}${url}`, fetchOptions);

        console.log('API Response:', {
          url: `${BASE_URL}${url}`,
          status: response.status,
          statusText: response.statusText
        });

        // Handle 401 Unauthorized - token expired
        if (response.status === 401 && !skipAuth) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw new ApiError('Session expired. Please log in again.', 401);
        }

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        console.log('Response data:', data);

        if (!response.ok) {
          const message = data?.message || data?.error || response.statusText;
          throw new ApiError(message, response.status, data);
        }

        // Normalize response data
        const normalized = normalizeResponse(data);
        
        // Handle different response structures
        if (normalized && typeof normalized === 'object') {
          // If response contains success flag, check it
          if ('success' in normalized && normalized.success === false) {
            throw new ApiError(normalized.message || 'Request failed', response.status, normalized);
          }
          
          // Return full response if it contains authentication data
          if ('token' in normalized) {
            return normalized;
          }
          
          // Extract user from user property
          if ('user' in normalized && !('data' in normalized) && !('requests' in normalized)) {
            return normalized;
          }
          
          // Extract data from nested structures
          if ('data' in normalized) {
            return normalizeResponse(normalized.data);
          }
          if ('requests' in normalized) {
            return normalizeResponse(normalized.requests);
          }
        }
        
        return normalized;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx except 429)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  })();

  // Cache pending request for deduplication (GET only)
  if (method === 'GET' && !skipDedup) {
    const key = getRequestKey(url, method, body);
    pendingRequests.set(key, requestPromise);
    requestPromise.finally(() => pendingRequests.delete(key));
  }

  return requestPromise.finally(() => clearTimeout(timeoutId));
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  isServerError() {
    return this.status >= 500;
  }

  isNetworkError() {
    return !this.status;
  }
}

/**
 * Error categorization for user-friendly messages
 */
export function getErrorMessage(error) {
  if (error?.name === 'AbortError') {
    return 'Request timeout. Please try again.';
  }

  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Please log in again.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 404) return 'The requested resource was not found.';
    if (error.status === 409) return 'This request conflicts with existing data.';
    if (error.status === 422) return 'Invalid input. Please check your data.';
    if (error.status >= 500) return 'Server error. Please try again later.';
    return error.message;
  }

  if (error?.name === 'TypeError' && /failed to fetch/i.test(error.message)) {
    return 'Unable to connect to the API server. Please ensure the backend is running and try again.';
  }

  if (error instanceof ApiError && error.isNetworkError()) {
    return 'Unable to connect to the server. Please verify the API service is reachable.';
  }

  if (!error) return 'An unknown error occurred.';
  return error.message || 'Something went wrong. Please try again.';
}

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  ADMIN: '/api/admin',
  REQUESTS: '/api/requests',
  NOTIFICATIONS: '/api/notifications',
  TASKS: '/api/tasks',
  DOCUMENTS: '/api/documents',
};
