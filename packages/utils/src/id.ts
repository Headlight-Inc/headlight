const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

function fillRandom(bytes: Uint8Array): Uint8Array {
	const crypto = globalThis.crypto;
	if (crypto?.getRandomValues) return crypto.getRandomValues(bytes);
	for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
	return bytes;
}

export function uuidv4(): string {
	const crypto = globalThis.crypto;
	if (crypto?.randomUUID) return crypto.randomUUID();
	const bytes = fillRandom(new Uint8Array(16));
	bytes[6] = (bytes[6]! & 0x0f) | 0x40;
	bytes[8] = (bytes[8]! & 0x3f) | 0x80;
	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
	return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

export function nanoid(size = 21): string {
	const bytes = fillRandom(new Uint8Array(size));
	let id = "";
	for (let i = 0; i < size; i++) id += ALPHABET[bytes[i]! & 63];
	return id;
}
