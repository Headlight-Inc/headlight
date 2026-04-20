export function parseAbbreviatedNumber(text: string): number | null {
	if (!text) return null;
	const clean = text.replace(/[$,<>~+]/g, "").trim();
	if (!clean) return null;
	if (clean.endsWith("B") || clean.endsWith("b"))
		return Math.round(parseFloat(clean) * 1e9);
	if (clean.endsWith("M") || clean.endsWith("m"))
		return Math.round(parseFloat(clean) * 1e6);
	if (clean.endsWith("K") || clean.endsWith("k"))
		return Math.round(parseFloat(clean) * 1e3);
	const num = parseFloat(clean.replace(/,/g, ""));
	return Number.isNaN(num) ? null : Math.round(num);
}

export function extractNumber(text: string, label: string): number | null {
	const regex = new RegExp(`${label}[\\s\\n:]*([\\d,\\.]+[KMBkmb]?)`, "i");
	const match = text.match(regex);
	return match ? parseAbbreviatedNumber(match[1]) : null;
}

export function extractJsonLd(html: string): any[] {
	const results: any[] = [];
	const matches = html.match(
		/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
	);
	if (!matches) return results;
	for (const m of matches) {
		try {
			const json = m.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
			results.push(JSON.parse(json));
		} catch {
			// ignore malformed block
		}
	}
	return results;
}

export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchViaBridge(
	url: string,
	bridgeUrl: string,
): Promise<string> {
	const resp = await fetch(bridgeUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url, mode: "html" }),
	});
	if (!resp.ok) throw new Error(`Bridge fetch failed: ${resp.status}`);
	const data = await resp.json();
	return data.html || "";
}

export async function fetchViaUserBrowser(url: string): Promise<string> {
	const resp = await fetch(url, {
		credentials: "include",
		headers: { Accept: "text/html" },
	});
	return resp.text();
}
