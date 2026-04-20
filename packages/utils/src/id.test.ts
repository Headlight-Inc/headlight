import { describe, it, expect } from "vitest";
import { uuidv4, nanoid } from "./id";

describe("id", () => {
	it("uuidv4 matches RFC shape", () => {
		expect(uuidv4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
	});

	it("nanoid is url-safe and the right length", () => {
		const id = nanoid(12);
		expect(id).toHaveLength(12);
		expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
	});
});
