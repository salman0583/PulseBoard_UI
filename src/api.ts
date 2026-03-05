console.log("API URL:", import.meta.env.VITE_API_BASE_URL);
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:9001';
export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export function createWebSocket(path: string) {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    return new WebSocket(`${WS_BASE_URL}${path}?token=${accessToken}`);
  }

  return new WebSocket(`${WS_BASE_URL}${path}`);
}
