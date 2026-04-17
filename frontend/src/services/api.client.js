/**
 * Production-ready API client
 * Uses improved apiRequest for:
 * - Response normalization (snake_case → camelCase)
 * - Request deduplication
 * - Error handling with retry logic
 * - Proper timeout handling
 */

import { apiRequest, normalizeResponse, ApiError, API_ENDPOINTS, BASE_URL } from '../utils/api.config';

// ==================== AUTH ====================
export async function login(email, password) {
  return apiRequest(`${API_ENDPOINTS.AUTH}/login`, {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export async function register(userData) {
  return apiRequest(`${API_ENDPOINTS.AUTH}/register`, {
    method: 'POST',
    body: userData,
    skipAuth: true,
  });
}

export async function getMe() {
  return apiRequest(`${API_ENDPOINTS.AUTH}/profile`);
}

export async function updateProfile(data) {
  return apiRequest(`${API_ENDPOINTS.AUTH}/profile`, {
    method: 'PUT',
    body: data,
  });
}

export async function changePassword(oldPassword, newPassword) {
  return apiRequest(`${API_ENDPOINTS.AUTH}/change-password`, {
    method: 'POST',
    body: { oldPassword, newPassword },
  });
}

// ==================== REQUESTS ====================
export async function getRequests(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`${API_ENDPOINTS.REQUESTS}${query ? '?' + query : ''}`);
}

export async function getAdminRequests(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`${API_ENDPOINTS.ADMIN}/requests${query ? '?' + query : ''}`);
}

export async function getRequest(id) {
  return apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}`);
}

export async function createRequest(payload) {
  return apiRequest(`${API_ENDPOINTS.REQUESTS}`, {
    method: 'POST',
    body: payload,
    skipDedup: true,
  });
}

export async function updateRequest(id, payload) {
  const response = await apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}`, {
    method: 'PUT',
    body: payload,
    skipDedup: true,
  });
  console.log(`[API] Request status updated: ${payload.status}`, { requestId: id, response });
  return response;
}

export async function deleteRequest(id) {
  return apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}`, {
    method: 'DELETE',
    skipDedup: true,
  });
}

export async function approveRequest(id, preparationLocation = '') {
  const response = await apiRequest(`${API_ENDPOINTS.ADMIN}/requests/${id}/approve`, {
    method: 'PUT',
    body: { preparationLocation },
    skipDedup: true,
  });
  console.log(`[API] Request approved`, { requestId: id });
  return response;
}

export async function startReviewRequest(id) {
  const response = await apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/start-review`, {
    method: 'PUT',
    skipDedup: true,
  });
  console.log(`[API] Request moved to in_review`, { requestId: id });
  return response;
}

export async function generateDocumentRequest(id) {
  const response = await apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/generate-document`, {
    method: 'PUT',
    skipDedup: true,
  });
  console.log(`[API] Document generated`, { requestId: id });
  return response;
}

export async function getRequestWithHistory(id) {
  return apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/history`);
}

export async function getRequestDocument(id) {
  return apiRequest(`${API_ENDPOINTS.REQUESTS}/${id}/document`);
}

export async function downloadRequestDocument(id, fileName = 'document.pdf') {
  const url = `${BASE_URL}${API_ENDPOINTS.REQUESTS}/${id}/download`;
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Download failed' }));
    throw new ApiError(error.message || 'Download failed', response.status);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}

// ==================== NOTIFICATIONS ====================
export async function getNotifications(unreadOnly = false, limit = 50, offset = 0) {
  const query = new URLSearchParams({
    ...(unreadOnly && { unreadOnly: 'true' }),
    limit,
    offset,
  }).toString();
  return apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}${query ? '?' + query : ''}`);
}

export async function getUnreadNotificationCount() {
  return apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/unread/count`);
}

export async function markNotificationAsRead(id) {
  return apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {
    method: 'PUT',
    skipDedup: true,
  });
}

export async function markAllNotificationsRead() {
  return apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`, {
    method: 'PUT',
    skipDedup: true,
  });
}

export async function deleteNotification(id) {
  return apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
    method: 'DELETE',
    skipDedup: true,
  });
}

// ==================== TASKS ====================
export async function createTask(task) {
  return apiRequest(`${API_ENDPOINTS.TASKS}`, {
    method: 'POST',
    body: task,
    skipDedup: true,
  });
}

export async function getMyTasks(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`${API_ENDPOINTS.TASKS}/my${query ? '?' + query : ''}`);
}

export async function getAllTasks(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`${API_ENDPOINTS.TASKS}${query ? '?' + query : ''}`);
}

export async function getTask(id) {
  return apiRequest(`${API_ENDPOINTS.TASKS}/${id}`);
}

export async function updateTask(id, data) {
  return apiRequest(`${API_ENDPOINTS.TASKS}/${id}`, {
    method: 'PUT',
    body: data,
    skipDedup: true,
  });
}

export async function deleteTask(id) {
  return apiRequest(`${API_ENDPOINTS.TASKS}/${id}`, {
    method: 'DELETE',
    skipDedup: true,
  });
}

// ==================== DOCUMENTS ====================
export async function requestDocument(documentData) {
  return apiRequest(`${API_ENDPOINTS.DOCUMENTS}`, {
    method: 'POST',
    body: documentData,
    skipDedup: true,
  });
}

export async function getMyDocuments() {
  return apiRequest(`${API_ENDPOINTS.DOCUMENTS}/my`);
}

export async function getAllDocuments(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`${API_ENDPOINTS.DOCUMENTS}${query ? '?' + query : ''}`);
}

export async function getDocument(id) {
  return apiRequest(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
}

export async function updateDocumentStatus(id, status, rejectionReason = null) {
  return apiRequest(`${API_ENDPOINTS.DOCUMENTS}/${id}/status`, {
    method: 'PUT',
    body: { status, rejectionReason },
    skipDedup: true,
  });
}

export async function uploadDocument(id, file, extraFields = {}) {
  const formData = new FormData();
  formData.append('document', file);
  Object.entries(extraFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.REQUESTS}/${id}/document`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data?.message || response.statusText, response.status);
    }

    const responseData = await response.json();
    const normalized = normalizeResponse(responseData);
    return normalizeResponse(normalized.request || normalized.data || normalized);
  } catch (error) {
    throw new ApiError(error.message || 'Upload failed');
  }
}

export async function downloadDocument(id, fileName) {
  const token = localStorage.getItem('token');
  let url = `${BASE_URL}${API_ENDPOINTS.DOCUMENTS}/${id}/download`;

  if (token) {
    url += `?token=${token}`;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'document.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function deleteDocument(id) {
  return apiRequest(`${API_ENDPOINTS.DOCUMENTS}/${id}`, {
    method: 'DELETE',
    skipDedup: true,
  });
}

export { ApiError, getErrorMessage } from '../utils/api.config';
