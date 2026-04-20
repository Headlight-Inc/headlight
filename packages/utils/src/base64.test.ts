import { describe, it, expect } from "vitest";
import {
	encodeBase64,
	decodeBase64ToString,
	encodeBase64Url,
	decodeBase64Url,
} from "./base64";

describe("base64", () => {
	it("round-trips utf-8", () => {
		const encoded = encodeBase64("héllo world");
		expect(decodeBase64ToString(encoded)).toBe("héllo world");
	});

	it("url-safe round-trip", () => {
		const encoded = encodeBase64Url("a/b+c==");
		const decoded = new TextDecoder().decode(decodeBase64Url(encoded));
		expect(decoded).toBe("a/b+c==");
	});
});
