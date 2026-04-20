// Web Streams compression. Works in browsers, Workers, and Node >= 18.
async function runStream(
	data: Uint8Array,
	format: "gzip" | "deflate" | "deflate-raw",
	mode: "compress" | "decompress",
): Promise<Uint8Array> {
	const Stream =
		mode === "compress"
			? (globalThis as { CompressionStream?: typeof CompressionStream })
					.CompressionStream
			: (globalThis as { DecompressionStream?: typeof DecompressionStream })
					.DecompressionStream;
	if (!Stream)
		throw new Error(
			`${mode === "compress" ? "CompressionStream" : "DecompressionStream"} is not available.`,
		);

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(data);
			controller.close();
		},
	});
	const transformed = stream.pipeThrough(
		new Stream(format) as any,
	) as ReadableStream<Uint8Array>;
	const chunks: Uint8Array[] = [];
	const reader = transformed.getReader();
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) chunks.push(value as Uint8Array);
	}
	const total = chunks.reduce((acc, c) => acc + c.byteLength, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const c of chunks) {
		out.set(c, offset);
		offset += c.byteLength;
	}
	return out;
}

export const gzip = (data: Uint8Array) => runStream(data, "gzip", "compress");
export const gunzip = (data: Uint8Array) =>
	runStream(data, "gzip", "decompress");
export const deflate = (data: Uint8Array) =>
	runStream(data, "deflate", "compress");
export const inflate = (data: Uint8Array) =>
	runStream(data, "deflate", "decompress");
