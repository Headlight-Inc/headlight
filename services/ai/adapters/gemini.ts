import { fetchWithRetry } from "../utils/fetchWithRetry";
import type { AIProviderAdapter, AIRequest, AIResponse } from "../types";

// Google Gemini — free tier: 15 RPM, 1M tokens/day
export function createGeminiAdapter(apiKey: string): AIProviderAdapter {
	const model = "gemini-2.0-flash";
	const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${model}`;

	return {
		provider: "gemini",
		async isAvailable() {
			return Boolean(apiKey);
		},
		async getQuotaRemaining() {
			return -1;
		},

		async complete(request: AIRequest): Promise<AIResponse> {
			const start = Date.now();
			const isEmbed = request.taskType === "embed";

			if (isEmbed) {
				const res = await fetchWithRetry(
					`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							model: "models/text-embedding-004",
							content: { parts: [{ text: request.prompt }] },
						}),
						timeout: 30000,
					},
				);

				if (!res.ok) throw new Error(`Gemini embed error ${res.status}`);
				const data = await res.json();
				const text = JSON.stringify(data.embedding?.values || []);

				return {
					text,
					provider: "gemini",
					model: "text-embedding-004",
					tokensUsed: request.prompt.length / 4,
					latencyMs: Date.now() - start,
					fromCache: false,
				};
			}

			const systemParts = request.systemPrompt
				? [{ text: request.systemPrompt }]
				: [];

			const body: Record<string, unknown> = {
				contents: [
					...(systemParts.length
						? [{ role: "model", parts: systemParts }]
						: []),
					{ role: "user", parts: [{ text: request.prompt }] },
				],
				generationConfig: {
					maxOutputTokens: request.maxTokens || 512,
					temperature: request.temperature ?? 0.3,
					...(request.format === "json"
						? { responseMimeType: "application/json" }
						: {}),
				},
			};

			const res = await fetchWithRetry(
				`${BASE}:generateContent?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
					timeout: isEmbed ? 30000 : 15000,
				},
			);

			if (!res.ok) throw new Error(`Gemini error ${res.status}`);

			const data = await res.json();
			const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

			return {
				text,
				provider: "gemini",
				model,
				tokensUsed: data.usageMetadata?.totalTokenCount || text.length / 4,
				latencyMs: Date.now() - start,
				fromCache: false,
			};
		},

		async *completeStream(
			request: AIRequest,
		): AsyncGenerator<string, AIResponse> {
			const start = Date.now();

			const systemParts = request.systemPrompt
				? [{ text: request.systemPrompt }]
				: [];
			const body = {
				contents: [
					...(systemParts.length
						? [{ role: "model", parts: systemParts }]
						: []),
					{ role: "user", parts: [{ text: request.prompt }] },
				],
				generationConfig: {
					maxOutputTokens: request.maxTokens || 512,
					temperature: request.temperature ?? 0.3,
				},
			};

			const res = await fetchWithRetry(
				`${BASE}:streamGenerateContent?key=${apiKey}&alt=sse`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
					timeout: 30000,
				},
			);

			if (!res.ok) throw new Error(`Gemini stream error ${res.status}`);

			const reader = res.body?.getReader();
			if (!reader) throw new Error("ReadableStream not supported");

			const decoder = new TextDecoder();
			let accumulatedText = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const dataStr = line.slice(6).trim();
						try {
							const data = JSON.parse(dataStr);
							const delta =
								data.candidates?.[0]?.content?.parts?.[0]?.text || "";
							if (delta) {
								accumulatedText += delta;
								yield delta;
							}
						} catch {
							/* skip parse errors */
						}
					}
				}
			}

			return {
				text: accumulatedText,
				provider: "gemini",
				model,
				tokensUsed: accumulatedText.length / 4,
				latencyMs: Date.now() - start,
				fromCache: false,
			};
		},
	};
}
