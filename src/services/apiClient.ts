const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const PUBLIC_AUTH_PATHS = new Set(['/auth/send-otp/', '/auth/verify-otp/', '/auth/resend-otp/']);
const REFRESH_PATH = '/auth/token/refresh/';

// Ensures concurrent 401s share a single in-flight refresh call instead of
// each firing their own (which would race and could invalidate each other's
// new tokens depending on backend refresh-token rotation behavior).
let refreshPromise: Promise<string> | null = null;

function extractErrorMessage(data: unknown, fallback: string): string {
  const errorData = data as ApiErrorResponse | null;
  const message = errorData?.detail ?? errorData?.message ?? fallback;
  if (typeof message === 'string') return message;

  const fieldErrors = Object.entries(message as Record<string, unknown>)
    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : String(errors)}`)
    .join(' ');
  return fieldErrors || JSON.stringify(message);
}

async function performRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem('metanest_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('metanest_access_token');
    localStorage.removeItem('metanest_refresh_token');
    throw new Error('Session expired. Please log in again.');
  }

  const data = (await response.json()) as { access: string };
  localStorage.setItem('metanest_access_token', data.access);
  return data.access;
}

function refreshAccessTokenOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const accessToken = localStorage.getItem('metanest_access_token');
  const shouldAttachAccessToken = accessToken && !PUBLIC_AUTH_PATHS.has(path);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(shouldAttachAccessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // On a 401 (expired/invalid access token), try refreshing once and retrying
  // the original request -- but never for the refresh endpoint itself, the
  // public auth endpoints, or a request that's already a retry (avoids loops).
  const isRefreshable = response.status === 401 && !PUBLIC_AUTH_PATHS.has(path) && path !== REFRESH_PATH;

  if (isRefreshable && !_isRetry) {
    try {
      await refreshAccessTokenOnce();
      return apiRequest<T>(path, options, true);
    } catch {
      // Refresh itself failed (refresh token expired/invalid) -- fall through
      // to normal error handling below using the original 401 response.
    }
  }

  const data = (await response.json().catch(() => null)) as T | ApiErrorResponse | null;
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, 'Request failed'));
  }

  return data as T;
}