// server/aiGateway.js
// Server-side AI gateway — mirrors client AIRouter but for Node.js
// Providers: Gemini (primary), Groq, GitHub, Anthropic, HuggingFace
// Falls back to heuristic if all providers fail

import { request as undiciRequest } from "undici";

const PROVIDERS = [
	{
		name: "gemini",
		envKey: "GEMINI_API_KEY",
		rpm: 15,
		rpd: 1500,
		tpd: 1000000,
		endpoint: (key) =>
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
		buildBody: (prompt, systemPrompt, maxTokens) => ({
			contents: [{ parts: [{ text: prompt }] }],
			systemInstruction: systemPrompt
				? { parts: [{ text: systemPrompt }] }
				: undefined,
			generationConfig: { maxOutputTokens: maxTokens || 512, temperature: 0.3 },
		}),
		parseResponse: (data) =>
			data.candidates?.[0]?.content?.parts?.[0]?.text || "",
		parseUsage: (data) => data.usageMetadata?.totalTokenCount || 0,
	},
	{
		name: "groq",
		envKey: "GROQ_API_KEY",
		rpm: 30,
		rpd: 14400,
		tpd: 500000,
		endpoint: () => "https://api.groq.com/openai/v1/chat/completions",
		buildBody: (prompt, systemPrompt, maxTokens) => ({
			model: "llama-3.1-8b-instant",
			messages: [
				...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
				{ role: "user", content: prompt },
			],
			max_tokens: maxTokens || 512,
			temperature: 0.3,
		}),
		buildHeaders: (key) => ({
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
		}),
		parseResponse: (data) => data.choices?.[0]?.message?.content || "",
		parseUsage: (data) => data.usage?.total_tokens || 0,
	},
	{
		name: "github",
		envKey: "GITHUB_MODELS_TOKEN",
		rpm: 15,
		rpd: 1500,
		tpd: 150000,
		endpoint: () => "https://models.inference.ai.azure.com/chat/completions",
		buildBody: (prompt, systemPrompt, maxTokens) => ({
			model: "gpt-4o-mini",
			messages: [
				...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
				{ role: "user", content: prompt },
			],
			max_tokens: maxTokens || 512,
			temperature: 0.3,
		}),
		buildHeaders: (key) => ({
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
		}),
		parseResponse: (data) => data.choices?.[0]?.message?.content || "",
		parseUsage: (data) => data.usage?.total_tokens || 0,
	},
	{
		name: "anthropic",
		envKey: "ANTHROPIC_API_KEY",
		rpm: 60,
		rpd: 99999,
		tpd: 999999,
		endpoint: () => "https://api.anthropic.com/v1/messages",
		buildBody: (prompt, systemPrompt, maxTokens) => ({
			model: "claude-3-5-sonnet-20241022",
			max_tokens: maxTokens || 1024,
			system: systemPrompt || undefined,
			messages: [{ role: "user", content: prompt }],
		}),
		buildHeaders: (key) => ({
			"x-api-key": key,
			"anthropic-version": "2023-06-01",
			"Content-Type": "application/json",
		}),
		parseResponse: (data) => data.content?.[0]?.text || "",
		parseUsage: (data) =>
			(data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
	},
	{
		name: "huggingface",
		envKey: "HF_TOKEN",
		rpm: 10,
		rpd: 1000,
		tpd: 100000,
		endpoint: () =>
			"https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
		buildBody: (prompt, systemPrompt) => ({
			inputs: systemPrompt
				? `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`
				: `<s>[INST] ${prompt} [/INST]`,
			parameters: {
				max_new_tokens: 512,
				temperature: 0.3,
				return_full_text: false,
			},
		}),
		buildHeaders: (key) => ({
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
		}),
		parseResponse: (data) =>
			Array.isArray(data)
				? data[0]?.generated_text || ""
				: data.generated_text || "",
		parseUsage: (data, text) => (text?.length || 0) / 4,
	},
];

// ─── Quota Management (Local + Optional Turso Sink) ──────────────────

async function getQuota(providerName, turso) {
	if (!turso) return null;
	try {
		const res = await turso.execute({
			sql: "SELECT * FROM ai_quota_state WHERE provider = ?",
			args: [providerName],
		});
		if (res.rows.length > 0) return res.rows[0];

		// Create initial state
		const today = new Date().toISOString().split("T")[0];
		await turso.execute({
			sql: "INSERT INTO ai_quota_state (provider, requests_today, tokens_today, requests_this_minute, last_reset_minute, last_reset_day) VALUES (?, 0, 0, 0, ?, ?)",
			args: [providerName, Date.now(), today],
		});
		return {
			provider: providerName,
			requests_today: 0,
			tokens_today: 0,
			requests_this_minute: 0,
			last_reset_minute: Date.now(),
			last_reset_day: today,
		};
	} catch (err) {
		console.error(`[AI:quota] Error getting quota for ${providerName}:`, err);
		return null;
	}
}

async function updateQuota(providerName, tokens, turso) {
	if (!turso) return;
	try {
		const today = new Date().toISOString().split("T")[0];
		// This is a bit simplified, ideally we'd do a transaction or handle resets in the query
		// But for performance, we'll do an UPDATE with logic
		await turso.execute({
			sql: `UPDATE ai_quota_state 
            SET requests_today = CASE WHEN last_reset_day != ? THEN 1 ELSE requests_today + 1 END,
                tokens_today = CASE WHEN last_reset_day != ? THEN ? ELSE tokens_today + ? END,
                requests_this_minute = CASE WHEN (strftime('%s','now') * 1000 - last_reset_minute) > 60000 THEN 1 ELSE requests_this_minute + 1 END,
                last_reset_minute = CASE WHEN (strftime('%s','now') * 1000 - last_reset_minute) > 60000 THEN strftime('%s','now') * 1000 ELSE last_reset_minute END,
                last_reset_day = ?
            WHERE provider = ?`,
			args: [today, today, tokens, tokens, today, providerName],
		});
	} catch (err) {
		console.error(`[AI:quota] Error updating quota for ${providerName}:`, err);
	}
}

async function hasQuota(provider, turso) {
	const state = await getQuota(provider.name, turso);
	if (!state) return true; // Fallback to local or just allow if DB fails

	const now = Date.now();
	const today = new Date().toISOString().split("T")[0];

	let reqMinute = state.requests_this_minute;
	let reqToday = state.requests_today;
	let tokensToday = state.tokens_today;

	if (now - state.last_reset_minute > 60000) reqMinute = 0;
	if (state.last_reset_day !== today) {
		reqToday = 0;
		tokensToday = 0;
	}

	return (
		reqMinute < provider.rpm &&
		reqToday < provider.rpd &&
		tokensToday < provider.tpd
	);
}

export async function getAIQuotaState(turso) {
	if (!turso) return [];
	const res = await turso.execute("SELECT * FROM ai_quota_state");
	return res.rows;
}

// ─── Main Completion Logic ──────────────────────────────────────────

export async function completeAI(
	{ prompt, systemPrompt, maxTokens, format },
	turso,
) {
	for (const provider of PROVIDERS) {
		const apiKey = process.env[provider.envKey];
		if (!apiKey) continue;

		// Check quota via Turso
		if (!(await hasQuota(provider, turso))) {
			console.warn(`[AI:${provider.name}] quota exhausted`);
			continue;
		}

		try {
			const url = provider.endpoint(apiKey);
			const body = provider.buildBody(prompt, systemPrompt, maxTokens);
			const headers = provider.buildHeaders
				? provider.buildHeaders(apiKey)
				: { "Content-Type": "application/json" };

			const startMs = Date.now();
			const { statusCode, body: resBody } = await undiciRequest(url, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
				headersTimeout: 15000,
				bodyTimeout: 30000,
			});

			const data = await resBody.json();
			const latencyMs = Date.now() - startMs;

			if (statusCode !== 200) {
				console.warn(`[AI:${provider.name}] status ${statusCode}`, data);
				if (statusCode === 429) {
					// Mark as rate limited in DB if possible
					await updateQuota(provider.name, 999999, turso);
				}
				continue;
			}

			const text = provider.parseResponse(data);
			if (!text) continue;

			const tokens = provider.parseUsage(data, text);
			await updateQuota(provider.name, tokens, turso);

			// If JSON format requested, try to extract JSON
			let result = text;
			if (format === "json") {
				const fenced =
					text.match(/```json\s*([\s\S]*?)```/i) ||
					text.match(/```\s*([\s\S]*?)```/i);
				const candidate = fenced?.[1]?.trim() || text.trim();
				const arrayMatch = candidate.match(/\[[\s\S]*\]/);
				const objectMatch = candidate.match(/\{[\s\S]*\}/);
				result = (arrayMatch?.[0] || objectMatch?.[0] || candidate).trim();
			}

			return {
				text: result,
				provider: provider.name,
				latencyMs,
				tokensUsed: tokens,
			};
		} catch (err) {
			console.warn(`[AI:${provider.name}] error: ${err.message}`);
			continue;
		}
	}
	return { text: "", error: "All providers failed" };
}

// Batch helper with rate limit delays
export async function aiBatch(requests, concurrency = 2, turso) {
	const results = [];
	for (let i = 0; i < requests.length; i += concurrency) {
		const chunk = requests.slice(i, i + concurrency);
		const chunkResults = await Promise.allSettled(
			chunk.map((req) => completeAI(req, turso)),
		);
		results.push(
			...chunkResults.map((r) => (r.status === "fulfilled" ? r.value : null)),
		);
		if (i + concurrency < requests.length) {
			await new Promise((r) => setTimeout(r, 500)); // Rate limit pause
		}
	}
	return results;
}
