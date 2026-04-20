export interface UrlNormalizeOptions {
	stripWww?: boolean;
	stripHash?: boolean;
	stripTrailingSlash?: boolean;
	stripDefaultPorts?: boolean;
	dropParams?: string[];
	lowercaseHost?: boolean;
}

const TRACKING_PARAMS = [
	"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
	"gclid", "fbclid", "mc_cid", "mc_eid", "msclkid"
];

const DEFAULT_OPTIONS: Required<UrlNormalizeOptions> = {
	stripWww: true,
	stripHash: true,
	stripTrailingSlash: true,
	stripDefaultPorts: true,
	dropParams: [...TRACKING_PARAMS],
	lowercaseHost: true
};

export function normalizeUrl(input: string, options: UrlNormalizeOptions = {}): string {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const parsed = new URL(input);

	if (opts.lowercaseHost) parsed.host = parsed.host.toLowerCase();
	if (opts.stripWww && parsed.host.startsWith("www.")) parsed.host = parsed.host.slice(4);

	if (opts.stripDefaultPorts) {
		if ((parsed.protocol === "http:" && parsed.port === "80") ||
			(parsed.protocol === "https:" && parsed.port === "443")) {
			parsed.port = "";
		}
	}

	if (opts.dropParams.length > 0) {
		const toDrop = new Set(opts.dropParams);
		for (const key of Array.from(parsed.searchParams.keys())) {
			if (toDrop.has(key)) parsed.searchParams.delete(key);
		}
	}

	parsed.searchParams.sort();

	if (opts.stripTrailingSlash && parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
		parsed.pathname = parsed.pathname.slice(0, -1);
	}

	if (opts.stripHash) parsed.hash = "";

	return parsed.toString();
}

export function toOrigin(input: string): string { return new URL(input).origin; }

export function sameOrigin(a: string, b: string): boolean {
	try { return toOrigin(a) === toOrigin(b); } catch { return false; }
}

export function depth(input: string): number {
	const { pathname } = new URL(input);
	if (pathname === "/" || pathname === "") return 0;
	return pathname.split("/").filter(Boolean).length;
}
