import { ScanReport, GlobalStats, User, ApiKey } from './types';

const LOCAL_API_BASE = 'http://localhost:8000/api/v1';

/**
 * Resolves the backend base URL.
 *
 * - `NEXT_PUBLIC_API_URL` always wins when set (e.g. docker-compose).
 * - On localhost we talk to the FastAPI dev server directly.
 * - Everywhere else we use the same-origin `/api/v1` path, which `next.config.js`
 *   proxies to the real backend. That way a deployed build never has a
 *   `localhost` URL baked into the client bundle, and requests bypass CORS.
 */
function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, '');

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost');
    if (isLocal) return LOCAL_API_BASE;
  }

  return '/api/v1';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('safesurf_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('safesurf_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('safesurf_token');
    localStorage.removeItem('safesurf_user');
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('safesurf_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${resolveApiBase()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'API Request Failed';
    try {
      const errData = await res.json();
      errMessage = errData.detail || errData.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Auth
  async register(email: string, password: string, full_name?: string) {
    const data = await request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    setAuthToken(data.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('safesurf_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('safesurf_user', JSON.stringify(data.user));
    }
    return data;
  },

  async me(): Promise<User> {
    return request<User>('/auth/me');
  },

  async resetPassword(email: string, new_password: string) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password }),
    });
  },

  // Scanner & Reports
  async runScan(url: string): Promise<ScanReport> {
    return request<ScanReport>('/scan', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  async getReport(id: number): Promise<ScanReport> {
    return request<ScanReport>(`/report/${id}`);
  },

  async getHistory(params?: { search?: string; status_filter?: string; saved_only?: boolean }): Promise<ScanReport[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status_filter) query.append('status_filter', params.status_filter);
    if (params?.saved_only) query.append('saved_only', 'true');
    return request<ScanReport[]>(`/history?${query.toString()}`);
  },

  async toggleSaveReport(id: number): Promise<{ is_saved: boolean }> {
    return request<{ is_saved: boolean }>(`/saved/${id}`, { method: 'POST' });
  },

  async deleteReport(id: number): Promise<void> {
    return request<void>(`/scan/${id}`, { method: 'DELETE' });
  },

  async getStats(): Promise<GlobalStats> {
    return request<GlobalStats>('/stats');
  },

  // Export URLs
  getExportCsvUrl(): string {
    const token = getAuthToken();
    return `${resolveApiBase()}/export/csv${token ? `?token=${token}` : ''}`;
  },

  getExportPdfUrl(scanId: number): string {
    return `${resolveApiBase()}/export/pdf/${scanId}`;
  },

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return request<ApiKey[]>('/apikeys');
  },

  async createApiKey(name: string): Promise<ApiKey & { raw_key: string }> {
    return request<ApiKey & { raw_key: string }>('/apikeys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async deleteApiKey(id: number): Promise<void> {
    return request<void>(`/apikeys/${id}`, { method: 'DELETE' });
  },

  // Admin
  async getAdminUsers(): Promise<User[]> {
    return request<User[]>('/admin/users');
  },

  async toggleUserStatus(userId: number, is_active?: boolean, role?: string) {
    const query = new URLSearchParams();
    if (is_active !== undefined) query.append('is_active', String(is_active));
    if (role) query.append('role', role);
    return request<{ message: string }>(`/admin/users/${userId}/status?${query.toString()}`, {
      method: 'PATCH',
    });
  },

  async getMaliciousDomains(): Promise<ScanReport[]> {
    return request<ScanReport[]>('/admin/malicious-domains');
  },

  async getSystemLogs(): Promise<any[]> {
    return request<any[]>('/admin/system-logs');
  }
};
