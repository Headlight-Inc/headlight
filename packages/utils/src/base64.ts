const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeBase64(input: Uint8Array | string): string {
	const bytes = typeof input === "string" ? textEncoder.encode(input) : input;
	if (typeof Buffer !== "undefined")
		return Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++)
		binary += String.fromCharCode(bytes[i]!);
	return btoa(binary);
}

export function decodeBase64(input: string): Uint8Array {
	if (typeof Buffer !== "undefined")
		return new Uint8Array(Buffer.from(input, "base64"));
	const binary = atob(input);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

export function encodeBase64Url(input: Uint8Array | string): string {
	return encodeBase64(input)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

export function decodeBase64Url(input: string): Uint8Array {
	const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
	const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
	return decodeBase64(padded);
}

export function decodeBase64ToString(input: string): string {
	return textDecoder.decode(decodeBase64(input));
}
