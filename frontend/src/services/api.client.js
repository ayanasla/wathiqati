import {
  apiRequest,
  API_ENDPOINTS,
  BASE_URL,
  ApiError,
  getErrorMessage
} from '../utils/api.config';


// ==================== HELPERS ====================
const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};


// ==================== AUTH ====================
export const login = (email, password) =>
  apiRequest(`${API_ENDPOINTS.AUTH}/login`, {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });

export const register = (userData) =>
  apiRequest(`${API_ENDPOINTS.AUTH}/register`, {
    method: 'POST',
    body: userData,
    skipAuth: true,
  });

export const getMe = () =>
  apiRequest(`${API_ENDPOINTS.AUTH}/profile`);

export const updateProfile = (data) =>
  apiRequest(`${API_ENDPOINTS.AUTH}/profile`, {
    method: 'PUT',
    body: data,
  });

export const changePassword = (oldPassword, newPassword) =>
  apiRequest(`${API_ENDPOINTS.AUTH}/change-password`, {
    method: 'POST',
    body: { oldPassword, newPassword },
  });


// ==================== REQUESTS ====================
export const getRequests = (filters = {}) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}${buildQuery(filters)}`);

export const getRequest = (id) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}`);

export const createRequest = (payload) =>
  apiRequest(API_ENDPOINTS.REQUESTS, {
    method: 'POST',
    body: payload,
  });

export const updateRequest = (id, payload) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}`, {
    method: 'PUT',
    body: payload,
  });

export const deleteRequest = (id) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}`, {
    method: 'DELETE',
  });

export const startReviewRequest = (id) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/start-review`, {
    method: 'PUT',
  });

export const generateDocumentRequest = (id) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/generate-document`, {
    method: 'PUT',
  });

export const getRequestDocument = (id) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/document`);

export const getRequestLocation = (id) =>
  apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/location`);


// ==================== ADMIN ====================
export const getAdminRequests = (filters = {}) =>
  apiRequest(`${API_ENDPOINTS.ADMIN}/requests${buildQuery(filters)}`);

export const approveRequest = (id, preparationLocation = '') =>
  apiRequest(`${API_ENDPOINTS.ADMIN}/requests/${id}/approve`, {
    method: 'PUT',
    body: { preparationLocation },
  });


// ==================== NOTIFICATIONS ====================
export const getNotifications = (unreadOnly = false, limit = 50, offset = 0) =>
  apiRequest(
    `${API_ENDPOINTS.NOTIFICATIONS}${buildQuery({
      unreadOnly: unreadOnly ? 'true' : '',
      limit,
      offset,
    })}`
  );

export const getUnreadNotificationCount = () =>
  apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/unread/count`);

export const markNotificationAsRead = (id) =>
  apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {
    method: 'PUT',
  });

export const markAllNotificationsRead = () =>
  apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`, {
    method: 'PUT',
  });

export const deleteNotification = (id) =>
  apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
    method: 'DELETE',
  });


// ==================== TASKS ====================
export const getTask = (id) =>
  apiRequest(`${API_ENDPOINTS.TASKS}/${id}`);

export const getAllTasks = () =>
  apiRequest(API_ENDPOINTS.TASKS);

export const createTask = (task) =>
  apiRequest(API_ENDPOINTS.TASKS, {
    method: 'POST',
    body: task,
  });

export const updateTask = (id, data) =>
  apiRequest(`${API_ENDPOINTS.TASKS}/${id}`, {
    method: 'PUT',
    body: data,
  });

export const deleteTask = (id) =>
  apiRequest(`${API_ENDPOINTS.TASKS}/${id}`, {
    method: 'DELETE',
  });


// ==================== FILE UPLOAD ====================
export const uploadDocument = async (id, file) => {
  const formData = new FormData();
  formData.append('document', file);

  const token = localStorage.getItem('token');

  const res = await fetch(
    `${BASE_URL}${API_ENDPOINTS.REQUESTS}/${id}/document`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Upload failed');
  }

  return res.json();
};


// ==================== DOWNLOAD ====================
export const downloadRequestDocument = async (id, fileName = 'document.pdf') => {
  const token = localStorage.getItem('token');

  const res = await fetch(
    `${BASE_URL}${API_ENDPOINTS.REQUESTS}/${id}/download`,
    {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Download failed');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};


// ==================== EXPORT ERRORS ====================
export { ApiError, getErrorMessage };