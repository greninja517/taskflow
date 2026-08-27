const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function register(email, password) {
  const data = await request('/auth/register', { method: 'POST', body: { email, password } });
  return data.token;
}

export async function login(email, password) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } });
  return data.token;
}

export function listProjects(token) {
  return request('/projects', { token });
}

export function createProject(token, { name, description }) {
  return request('/projects', { method: 'POST', token, body: { name, description } });
}

export function listTasks(token, projectId) {
  return request(`/tasks?projectId=${projectId}`, { token });
}

export function createTask(token, task) {
  return request('/tasks', { method: 'POST', token, body: task });
}

export function updateTask(token, id, updates) {
  return request(`/tasks/${id}`, { method: 'PATCH', token, body: updates });
}

export function deleteTask(token, id) {
  return request(`/tasks/${id}`, { method: 'DELETE', token });
}
