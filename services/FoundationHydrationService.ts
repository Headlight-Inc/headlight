// services/FoundationHydrationService.ts

const configuredCrawlerApiUrl = (import.meta as any).env?.VITE_CRAWLER_API_URL;
const apiBase = configuredCrawlerApiUrl || (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : 'http://localhost:3001');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export class FoundationHydrationService {
  static fetchFingerprint(projectId: string, sessionId: string) {
    return request<{ data: any }>(`/api/internal/projects/${projectId}/crawls/${sessionId}/fingerprint`);
  }

  static fetchMetrics(projectId: string, sessionId: string) {
    return request<{ data: any[] }>(`/api/internal/projects/${projectId}/crawls/${sessionId}/metrics`);
  }

  static fetchActions(projectId: string, sessionId: string) {
    return request<{ data: any[] }>(`/api/internal/projects/${projectId}/crawls/${sessionId}/actions`);
  }
}
