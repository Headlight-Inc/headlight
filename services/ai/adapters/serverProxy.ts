import { fetchWithRetry } from "../utils/fetchWithRetry";
import type { AIProviderAdapter, AIRequest, AIResponse } from "../types";

/**
 * ServerProxyAdapter routes requests through the project's own server.
 * This acts as a fallback when the user hasn't provided their own API keys,
 * utilizing the server's environment-level keys.
 */
export function createServerProxyAdapter(): AIProviderAdapter {
	const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

	return {
		provider: "openai", // Using openai as a placeholder type or extending in types.ts

		async isAvailable() {
			try {
				const res = await fetch(`${BASE_URL}/api/health`);
				return res.ok;
			} catch {
				return false;
			}
		},

		async getQuotaRemaining() {
			try {
				const res = await fetch(`${BASE_URL}/api/ai/quota`);
				if (!res.ok) return 0;
				const data = await res.json();
				// Sum up total available quota or check specific provider availability
				return data.length > 0 ? -1 : 0;
			} catch {
				return 0;
			}
		},

		async complete(request: AIRequest): Promise<AIResponse> {
			const start = Date.now();
			const res = await fetchWithRetry(`${BASE_URL}/api/ai/complete`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
				timeout: 30000,
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Server proxy request failed");
			}

			const data = await res.json();
			return {
				text: data.text,
				provider: data.provider || "openai",
				model: "server-fallback",
				tokensUsed: data.tokensUsed || 0,
				latencyMs: Date.now() - start,
				fromCache: false,
			};
		},
	};
}
