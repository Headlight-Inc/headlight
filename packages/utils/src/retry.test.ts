import { describe, it, expect, vi } from "vitest";
import { retry } from "./retry";

describe("retry", () => {
	it("retries then resolves", async () => {
		let calls = 0;
		const fn = vi.fn(async () => {
			calls++;
			if (calls < 3) throw new Error("boom");
			return "ok";
		});
		const result = await retry(fn, { retries: 4, minDelayMs: 1, jitter: false });
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(3);
	});
});
