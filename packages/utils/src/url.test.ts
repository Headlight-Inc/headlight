import { describe, it, expect } from "vitest";
import { normalizeUrl, depth, sameOrigin } from "./url";

describe("url", () => {
	it("drops tracking params and www", () => {
		const result = normalizeUrl("https://www.Acme.com/path/?utm_source=x&b=2&a=1");
		expect(result).toBe("https://acme.com/path?a=1&b=2");
	});

	it("computes path depth", () => {
		expect(depth("https://acme.com/")).toBe(0);
		expect(depth("https://acme.com/blog/post")).toBe(2);
	});

	it("detects same origin", () => {
		expect(sameOrigin("https://a.com/x", "https://a.com/y")).toBe(true);
		expect(sameOrigin("https://a.com", "https://b.com")).toBe(false);
	});
});
