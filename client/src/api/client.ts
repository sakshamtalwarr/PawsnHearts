import { Animal, LedgerEntry, Stats, SiteSettings, AdminUser } from '../types';

const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('paws_admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('paws_admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('paws_admin_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data as T;
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ user: AdminUser }>('/auth/me'),
  logout: () => {
    clearToken();
    return request<{ message: string }>('/auth/logout', { method: 'POST' });
  },
};

// Animals API
export const animalsApi = {
  getAll: (params?: { category?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return request<{ animals: Animal[] }>(`/animals?${q.toString()}`);
  },
  getBySlug: (slug: string) => request<{ animal: Animal }>(`/animals/${slug}`),
  create: (data: Partial<Animal>) =>
    request<{ animal: Animal }>('/animals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Animal>) =>
    request<{ animal: Animal }>(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/animals/${id}`, {
      method: 'DELETE',
    }),
};

// Ledger API
export const ledgerApi = {
  getPublic: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<{
      entries: LedgerEntry[];
      summary: {
        total_verified_donations: string | number;
        total_pending_donations: string | number;
        total_expenses: string | number;
        verified_count: string | number;
      };
    }>(`/ledger${q}`);
  },
  create: (data: Partial<LedgerEntry>) =>
    request<{ entry: LedgerEntry }>('/ledger', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<LedgerEntry>) =>
    request<{ entry: LedgerEntry }>(`/ledger/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleVerify: (id: string) =>
    request<{ entry: LedgerEntry }>(`/ledger/${id}/toggle-verify`, {
      method: 'PATCH',
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/ledger/${id}`, {
      method: 'DELETE',
    }),
};

// Stats & Settings API
export const statsApi = {
  getStats: (visit = false) =>
    request<{ stats: Stats }>(`/stats?visit=${visit ? 'true' : 'false'}`),
  getSettings: () => request<{ settings: SiteSettings }>('/stats/settings'),
  updateSettings: (settings: Partial<SiteSettings>) =>
    request<{ message: string }>('/stats/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
};

// Upload API (Cloudflare R2 or local disk)
export const uploadApi = {
  uploadSingle: async (file: File, folder = 'animals') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return request<{ file: { url: string; key: string } }>('/upload/single', {
      method: 'POST',
      body: formData,
    });
  },
};
