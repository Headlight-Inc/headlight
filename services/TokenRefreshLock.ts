/**
 * Shared Mutex for Google Token Refresh
 *
 * Prevents race conditions when multiple concurrent requests (e.g. GSC Tier 1,
 * GSC Tier 2, and GA4) all hit a 401 simultaneously and try to refresh.
 */

const refreshPromises = new Map<string, Promise<string | null>>();

export async function refreshWithLock(
	email: string,
	refreshFn: (email: string) => Promise<string | null>,
): Promise<string | null> {
	// If a refresh is already in flight for this email, wait for it
	const existing = refreshPromises.get(email);
	if (existing) {
		return existing;
	}

	// Start a new refresh
	const promise = refreshFn(email).finally(() => {
		refreshPromises.delete(email);
	});

	refreshPromises.set(email, promise);
	return promise;
}
