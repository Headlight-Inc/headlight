import { sleep } from "./sleep";

export interface RetryOptions {
	retries?: number;
	minDelayMs?: number;
	maxDelayMs?: number;
	factor?: number;
	jitter?: boolean;
	onAttempt?: (attempt: number, error: unknown) => void;
	shouldRetry?: (error: unknown, attempt: number) => boolean;
	signal?: AbortSignal;
}

export async function retry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {},
): Promise<T> {
	const {
		retries = 3,
		minDelayMs = 200,
		maxDelayMs = 5_000,
		factor = 2,
		jitter = true,
		onAttempt,
		shouldRetry = () => true,
		signal,
	} = options;

	let attempt = 0;
	let lastError: unknown;
	while (attempt <= retries) {
		if (signal?.aborted) throw signal.reason ?? new Error("Aborted");
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			onAttempt?.(attempt, error);
			if (attempt === retries || !shouldRetry(error, attempt)) break;
			const exp = Math.min(maxDelayMs, minDelayMs * Math.pow(factor, attempt));
			const delay = jitter
				? Math.floor(exp * (0.5 + Math.random() * 0.5))
				: exp;
			await sleep(delay, signal);
			attempt++;
		}
	}
	throw lastError;
}
