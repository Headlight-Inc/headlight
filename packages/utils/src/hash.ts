const textEncoder = new TextEncoder();

async function digest(input: string, algorithm: "SHA-1" | "SHA-256" | "SHA-512"): Promise<ArrayBuffer> {
	const crypto = globalThis.crypto;
	if (!crypto?.subtle) throw new Error("SubtleCrypto is not available in this runtime.");
	return crypto.subtle.digest(algorithm, textEncoder.encode(input));
}

function toHex(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let hex = "";
	for (let i = 0; i < bytes.length; i++) hex += bytes[i]!.toString(16).padStart(2, "0");
	return hex;
}

export async function sha1(input: string): Promise<string> { return toHex(await digest(input, "SHA-1")); }
export async function sha256(input: string): Promise<string> { return toHex(await digest(input, "SHA-256")); }
export async function sha512(input: string): Promise<string> { return toHex(await digest(input, "SHA-512")); }

// Fast non-cryptographic 32-bit hash (FNV-1a). Used for dedupe keys, not security.
export function fnv1a(input: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}
