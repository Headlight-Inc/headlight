export type AIErrorType =
	| "rate_limit"
	| "auth"
	| "timeout"
	| "server"
	| "parse"
	| "unknown";

export class AIProviderError extends Error {
	constructor(
		public type: AIErrorType,
		message: string,
		public status?: number,
		public retryAfter?: number,
	) {
		super(message);
		this.name = "AIProviderError";
	}
}

interface FetchWithRetryOptions extends RequestInit {
	timeout?: number;
	maxRetries?: number;
	initialDelay?: number;
}

/**
 * fetchWithRetry wraps fetch with:
 * - AbortController timeout
 * - Exponential backoff retry (default 2 retries)
 * - Error classification (rate_limit, auth, timeout, server)
 */
export async function fetchWithRetry(
	url: string,
	options: FetchWithRetryOptions = {},
): Promise<Response> {
	const {
		timeout = 15000,
		maxRetries = 2,
		initialDelay = 1000,
		...fetchOptions
	} = options;

	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				...fetchOptions,
				signal: controller.signal,
			});

			clearTimeout(timer);

			// Handle 429 Rate Limit
			if (response.status === 429) {
				const retryAfter = parseInt(
					response.headers.get("Retry-After") || "0",
					10,
				);
				throw new AIProviderError(
					"rate_limit",
					"Rate limit exceeded",
					429,
					retryAfter,
				);
			}

			// Handle Auth Errors
			if (response.status === 401 || response.status === 403) {
				throw new AIProviderError(
					"auth",
					`Authentication failed (${response.status})`,
					response.status,
				);
			}

			// Handle Server Errors (5xx)
			if (response.status >= 500) {
				throw new AIProviderError(
					"server",
					`Server error (${response.status})`,
					response.status,
				);
			}

			// success!
			return response;
		} catch (error: any) {
			clearTimeout(timer);

			let classifiedError: AIProviderError;

			if (error.name === "AbortError") {
				classifiedError = new AIProviderError(
					"timeout",
					`Request timed out after ${timeout}ms`,
				);
			} else if (error instanceof AIProviderError) {
				classifiedError = error;
			} else {
				classifiedError = new AIProviderError(
					"unknown",
					error.message || "Unknown fetch error",
				);
			}

			// Decide whether to retry
			const shouldRetry =
				(classifiedError.type === "timeout" ||
					classifiedError.type === "server") &&
				attempt < maxRetries;

			if (!shouldRetry) {
				throw classifiedError;
			}

			// Exponential backoff
			const delay = initialDelay * Math.pow(3, attempt); // 1s, 3s, 9s...
			await new Promise((resolve) => setTimeout(resolve, delay));
			lastError = classifiedError;
		}
	}

	throw (
		lastError || new AIProviderError("unknown", "Fetch failed after retries")
	);
}
