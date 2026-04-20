import { describe, it, expect } from "vitest";
import { fnv1a, sha256 } from "./hash";

describe("hash", () => {
	it("fnv1a is deterministic", () => {
		expect(fnv1a("hello")).toBe(fnv1a("hello"));
		expect(fnv1a("hello")).not.toBe(fnv1a("world"));
	});

	it("sha256 returns 64-char hex", async () => {
		const h = await sha256("headlight");
		expect(h).toMatch(/^[0-9a-f]{64}$/);
	});
});
