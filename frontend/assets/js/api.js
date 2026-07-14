// API Configuration - detects frontend host to determine API URL
function getApiBaseUrl() {
  const hostname = window.location.hostname;
  if (hostname === '127.0.0.1' || hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  // In production, API might be on same server
  return '/api';
}
const API_BASE_URL = getApiBaseUrl();

// Get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Get auth headers
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Handle response
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = { message: 'Invalid server response' };
  }
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

// API methods
const API = {
  // Auth
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async studentRegister(data) {
    const response = await fetch(`${API_BASE_URL}/auth/student-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateProfile(data) {
    const response = await fetch(`${API_BASE_URL}/auth/updatedetails`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updatePassword(data) {
    const response = await fetch(`${API_BASE_URL}/auth/updatepassword`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Dashboard
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getRecentAttachees() {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-attachees`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMonthlyRegistrations() {
    const response = await fetch(`${API_BASE_URL}/dashboard/monthly-registrations`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getDepartmentDistribution() {
    const response = await fetch(`${API_BASE_URL}/dashboard/department-distribution`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Attachees
  async getAttachees(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/attachees?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getAttachee(id) {
    const response = await fetch(`${API_BASE_URL}/attachees/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createAttachee(data) {
    const response = await fetch(`${API_BASE_URL}/attachees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateAttachee(id, data) {
    const response = await fetch(`${API_BASE_URL}/attachees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteAttachee(id) {
    const response = await fetch(`${API_BASE_URL}/attachees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async assignDepartment(id, department) {
    const response = await fetch(`${API_BASE_URL}/attachees/${id}/assign-department`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ department }),
    });
    return handleResponse(response);
  },

  async assignSupervisor(id, supervisor) {
    const response = await fetch(`${API_BASE_URL}/attachees/${id}/assign-supervisor`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ supervisor }),
    });
    return handleResponse(response);
  },

  async updateAttacheeStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/attachees/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  async getAttacheeStats() {
    const response = await fetch(`${API_BASE_URL}/attachees/stats/counts`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Departments
  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createDepartment(data) {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateDepartment(id, data) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteDepartment(id) {
    const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Supervisors
  async getSupervisors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/supervisors?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createSupervisor(data) {
    const response = await fetch(`${API_BASE_URL}/supervisors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateSupervisor(id, data) {
    const response = await fetch(`${API_BASE_URL}/supervisors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteSupervisor(id) {
    const response = await fetch(`${API_BASE_URL}/supervisors/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMyAttachees() {
    const response = await fetch(`${API_BASE_URL}/supervisors/my-attachees`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Reports
  async getActiveAttacheesReport() {
    const response = await fetch(`${API_BASE_URL}/reports/active-attachees`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getDepartmentalPlacementReport() {
    const response = await fetch(`${API_BASE_URL}/reports/departmental-placement`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getCompletionReport() {
    const response = await fetch(`${API_BASE_URL}/reports/completion`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getSupervisorWorkloadReport() {
    const response = await fetch(`${API_BASE_URL}/reports/supervisor-workload`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getAttacheeFullReport(id) {
    const response = await fetch(`${API_BASE_URL}/reports/attachee/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Notifications
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async markNotificationRead(id) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async markAllNotificationsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Users
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async registerUser(data) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateUser(id, data) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};