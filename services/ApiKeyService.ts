export interface ApiKeyRecord {
	id: string;
	projectId: string;
	name: string;
	scopes: string[];
	rateLimitPerMinute: number;
	lastUsedAt: string | null;
	createdAt: string;
}

export interface CreateApiKeyResponse {
	record: ApiKeyRecord;
	token: string;
}

const configuredCrawlerApiUrl = (import.meta as any).env?.VITE_CRAWLER_API_URL;
const apiBase =
	configuredCrawlerApiUrl ||
	(typeof window !== "undefined"
		? `${window.location.protocol}//${window.location.hostname}:3001`
		: "http://localhost:3001");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${apiBase}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(init?.headers || {}),
		},
		...init,
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `Request failed with ${response.status}`);
	}

	return response.json() as Promise<T>;
}

export class ApiKeyService {
	static list(projectId: string) {
		return request<{ data: ApiKeyRecord[] }>(
			`/api/internal/projects/${projectId}/api-keys`,
		);
	}

	static create(
		projectId: string,
		payload: { name: string; scopes: string[]; rateLimitPerMinute?: number },
	) {
		return request<CreateApiKeyResponse>(
			`/api/internal/projects/${projectId}/api-keys`,
			{
				method: "POST",
				body: JSON.stringify(payload),
			},
		);
	}

	static revoke(projectId: string, keyId: string) {
		return request<{ success: boolean }>(
			`/api/internal/projects/${projectId}/api-keys/${keyId}`,
			{
				method: "DELETE",
			},
		);
	}
}
