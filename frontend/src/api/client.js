const BASIS_URL = (import.meta.env.VITE_API_URL || '') + '/api';

async function verzoek(pad, opties = {}) {
  const res = await fetch(`${BASIS_URL}${pad}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opties.headers },
    ...opties,
  });

  if (res.status === 401) {
    window.location.href = '/login';
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.fout || `Fout ${res.status}`);
  }

  return data;
}

export const api = {
  get: (pad) => verzoek(pad),
  post: (pad, body) => verzoek(pad, { method: 'POST', body: JSON.stringify(body) }),
  put: (pad, body) => verzoek(pad, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (pad) => verzoek(pad, { method: 'DELETE' }),
};

// Specifieke API functies
export const authApi = {
  login: (wachtwoord) => verzoek('/login', { method: 'POST', body: JSON.stringify({ wachtwoord }) }),
  logout: () => verzoek('/logout', { method: 'POST' }),
  status: () => verzoek('/auth-status'),
};

export const klantenApi = {
  lijst: () => api.get('/klanten'),
  ophalen: (id) => api.get(`/klanten/${id}`),
  aanmaken: (data) => api.post('/klanten', data),
  bewerken: (id, data) => api.put(`/klanten/${id}`, data),
  verwijderen: (id) => api.delete(`/klanten/${id}`),
};

export const facturenApi = {
  lijst: (status) => api.get(`/facturen${status ? `?status=${status}` : ''}`),
  ophalen: (id) => api.get(`/facturen/${id}`),
  aanmaken: (data) => api.post('/facturen', data),
  bewerken: (id, data) => api.put(`/facturen/${id}`, data),
  verwijderen: (id) => api.delete(`/facturen/${id}`),
  pdfUrl: (id) => `${BASIS_URL}/facturen/${id}/pdf`,
  previewEmail: (id) => api.get(`/facturen/${id}/preview-email`),
  verstuurEmail: (id) => api.post(`/facturen/${id}/verstuur-email`),
  markeerBetaald: (id) => api.post(`/facturen/${id}/markeer-betaald`),
};

export const feestApi = {
  lijst: () => api.get('/feestverzoeken'),
  ophalen: (id) => api.get(`/feestverzoeken/${id}`),
  aanmaken: (data) => api.post('/feestverzoeken', data),
  bewerken: (id, data) => api.put(`/feestverzoeken/${id}`, data),
  verwijderen: (id) => api.delete(`/feestverzoeken/${id}`),
  previewEmail: (id) => api.post(`/feestverzoeken/${id}/preview-email`),
  verstuurEmail: (id) => api.post(`/feestverzoeken/${id}/verstuur-email`),
};

export const templatesApi = {
  lijst: () => api.get('/templates'),
  ophalen: (id) => api.get(`/templates/${id}`),
  bewerken: (id, data) => api.put(`/templates/${id}`, data),
};

export const instellingenApi = {
  ophalen: () => api.get('/instellingen'),
  opslaan: (data) => api.put('/instellingen', data),
  testEmail: () => api.post('/instellingen/test-email'),
  logoUpload: async (bestand) => {
    const form = new FormData();
    form.append('logo', bestand);
    const res = await fetch(`${BASIS_URL}/logo`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.fout || 'Upload mislukt');
    return data;
  },
};
