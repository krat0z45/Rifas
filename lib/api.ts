export const getToken = () => localStorage.getItem('token');
export const setToken = (t: string) => localStorage.setItem('token', t);
export const removeToken = () => localStorage.removeItem('token');

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'API Error');
  }

  return res.json();
};

export const api = {
  login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  
  getRaffles: () => request('/raffles'),
  getRaffle: (id: string) => request(`/raffles/${id}`),
  getRaffleReservations: (id: string) => request(`/raffles/${id}/reservations`),
  createRaffle: (data: any) => request('/raffles', { method: 'POST', body: JSON.stringify(data) }),
  updateRaffle: (id: string, data: any) => request(`/raffles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  getReservations: () => request('/reservations'),
  createReservation: (data: any) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateReservationStatus: (id: string, status: string) => request(`/reservations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getReservationByFolio: (folio: string) => request(`/reservations/folio/${folio}`),
  
  getSettings: () => request('/settings'),
  updateSettings: (data: any) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  
  getUsers: () => request('/users'),
  createUser: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
  
  getMetrics: () => request('/metrics')
};
