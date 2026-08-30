const API_BASE = '/api';

export function getStoredToken() {
  return localStorage.getItem('lumina_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('lumina_token', token);
  } else {
    localStorage.removeItem('lumina_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during the request.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authAPI = {
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  login: (payload) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me', {
    method: 'GET'
  }),
  updateRole: (role) => request('/auth/role', {
    method: 'PATCH',
    body: JSON.stringify({ role })
  })
};

export const transactionsAPI = {
  getAll: () => request('/transactions', {
    method: 'GET'
  }),
  create: (tx) => request('/transactions', {
    method: 'POST',
    body: JSON.stringify(tx)
  }),
  delete: (id) => request(`/transactions/${id}`, {
    method: 'DELETE'
  }),
  reset: () => request('/transactions/reset', {
    method: 'POST'
  })
};
