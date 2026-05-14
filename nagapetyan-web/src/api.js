const defaultApiBase =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://nagapetyan.danbel.ru/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || defaultApiBase;

async function request(path, { method = 'GET', body, role, organizationId, isFormData = false } = {}) {
  const headers = {
    ...(role ? { 'X-Role': role } : {}),
    ...(organizationId ? { 'X-Organization-Id': String(organizationId) } : {}),
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
  registerOwner: (body) => request('/auth/register', { method: 'POST', body }),
  getOrganizations: (role, organizationId) => request('/organizations', { role, organizationId }),
  getOrganization: (role, organizationId, targetOrganizationId) =>
    request(`/organizations/${targetOrganizationId}`, { role, organizationId }),
  createOrganization: (role, organizationId, body) => request('/organizations', { method: 'POST', role, organizationId, body }),
  updateOrganization: (role, organizationId, body) => request(`/organizations/${organizationId}`, { method: 'PUT', role, organizationId, body }),
  deleteOrganization: (role, organizationId) => request(`/organizations/${organizationId}`, { method: 'DELETE', role, organizationId }),
  getDashboard: (role, organizationId) => request(`/organizations/${organizationId}/dashboard`, { role, organizationId }),
  getMembers: (role, organizationId) => request(`/organizations/${organizationId}/members`, { role, organizationId }),
  getMember: (role, organizationId, memberId) => request(`/organizations/${organizationId}/members/${memberId}`, { role, organizationId }),
  createMember: (role, organizationId, body) => request(`/organizations/${organizationId}/members`, { method: 'POST', role, organizationId, body }),
  updateMember: (role, organizationId, memberId, body) => request(`/organizations/${organizationId}/members/${memberId}`, { method: 'PUT', role, organizationId, body }),
  deleteMember: (role, organizationId, memberId) => request(`/organizations/${organizationId}/members/${memberId}`, { method: 'DELETE', role, organizationId }),
  getReports: (role, organizationId) => request(`/organizations/${organizationId}/reports`, { role, organizationId }),
  getReport: (role, organizationId, reportId) => request(`/organizations/${organizationId}/reports/${reportId}`, { role, organizationId }),
  createReport: (role, organizationId, body) => request(`/organizations/${organizationId}/reports`, { method: 'POST', role, organizationId, body }),
  updateReport: (role, organizationId, reportId, body) => request(`/organizations/${organizationId}/reports/${reportId}`, { method: 'PUT', role, organizationId, body }),
  deleteReport: (role, organizationId, reportId) => request(`/organizations/${organizationId}/reports/${reportId}`, { method: 'DELETE', role, organizationId }),
  importReports: (role, organizationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/organizations/${organizationId}/reports/import`, {
      method: 'POST',
      role,
      organizationId,
      body: formData,
      isFormData: true,
    });
  },
};
