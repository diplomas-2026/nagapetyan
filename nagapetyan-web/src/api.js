const defaultApiBase =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://nagapetyan.danbel.ru/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || defaultApiBase;

async function request(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const init = {
    method,
    headers,
  };

  if (body !== undefined) {
    if (isFormData) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = typeof payload === 'string' ? payload : payload?.message || 'Не удалось выполнить запрос';
    throw new Error(errorMessage);
  }

  return payload;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getOrganizations: (token) => request('/organizations', { token }),
  getOrganization: (token, targetOrganizationId) => request(`/organizations/${targetOrganizationId}`, { token }),
  createOrganization: (token, body) => request('/organizations', { method: 'POST', token, body }),
  updateOrganization: (token, organizationId, body) => request(`/organizations/${organizationId}`, { method: 'PUT', token, body }),
  deleteOrganization: (token, organizationId) => request(`/organizations/${organizationId}`, { method: 'DELETE', token }),
  getDashboard: (token, organizationId) => request(`/organizations/${organizationId}/dashboard`, { token }),
  getMembers: (token, organizationId) => request(`/organizations/${organizationId}/members`, { token }),
  getMember: (token, organizationId, memberId) => request(`/organizations/${organizationId}/members/${memberId}`, { token }),
  createMember: (token, organizationId, body) => request(`/organizations/${organizationId}/members`, { method: 'POST', token, body }),
  updateMember: (token, organizationId, memberId, body) => request(`/organizations/${organizationId}/members/${memberId}`, { method: 'PUT', token, body }),
  deleteMember: (token, organizationId, memberId) => request(`/organizations/${organizationId}/members/${memberId}`, { method: 'DELETE', token }),
  getReports: (token, organizationId) => request(`/organizations/${organizationId}/reports`, { token }),
  getReport: (token, organizationId, reportId) => request(`/organizations/${organizationId}/reports/${reportId}`, { token }),
  createReport: (token, organizationId, body) => request(`/organizations/${organizationId}/reports`, { method: 'POST', token, body }),
  updateReport: (token, organizationId, reportId, body) => request(`/organizations/${organizationId}/reports/${reportId}`, { method: 'PUT', token, body }),
  deleteReport: (token, organizationId, reportId) => request(`/organizations/${organizationId}/reports/${reportId}`, { method: 'DELETE', token }),
  getActionHistory: (token, organizationId, actorLogin) => {
    const query = actorLogin ? `?actorLogin=${encodeURIComponent(actorLogin)}` : '';
    return request(`/organizations/${organizationId}/actions${query}`, { token });
  },
  revertActionHistory: (token, organizationId, historyId) =>
    request(`/organizations/${organizationId}/actions/${historyId}/revert`, { method: 'POST', token }),
  importReports: (token, organizationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/organizations/${organizationId}/reports/import`, {
      method: 'POST',
      token,
      body: formData,
      isFormData: true,
    });
  },
};
