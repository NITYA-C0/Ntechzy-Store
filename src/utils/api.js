const TOKEN_KEY = 'ntechzy_token';
const GUEST_KEY = 'ntechzy_guest_id';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-guest-id': getGuestId(),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers,
    });
  } catch {
    const error = new Error('Cannot reach API. Is the server running?');
    error.status = 0;
    throw error;
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 120) || 'Request failed' };
    }
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/** Retry a few times (helps when Vite starts before Express). */
export async function apiWithRetry(path, options = {}, retries = 4) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await api(path, options);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastError;
}
