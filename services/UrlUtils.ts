/**
 * UrlUtils — Shared utilities for URL normalization and validation
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
	try {
		const url = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);
		url.hash = ""; // Remove fragment

		// Remove standard ports
		if (
			(url.protocol === "http:" && url.port === "80") ||
			(url.protocol === "https:" && url.port === "443")
		) {
			url.port = "";
		}

		return url.href;
	} catch {
		return null;
	}
}

export function isInternalUrl(url: string, baseHostname: string): boolean {
	try {
		const targetHost = new URL(url).hostname.replace("www.", "");
		const baseHost = baseHostname.replace("www.", "");
		return targetHost === baseHost;
	} catch {
		return false;
	}
}
