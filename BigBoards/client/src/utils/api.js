function getToken() {
  return localStorage.getItem('bb_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),

  uploadCsv: (path, file, extraFields = {}) => {
    const form = new FormData();
    form.append('csv', file);
    for (const [k, v] of Object.entries(extraFields)) form.append(k, v);
    return request(path, { method: 'POST', body: form });
  },
};
