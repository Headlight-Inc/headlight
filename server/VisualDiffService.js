// server/VisualDiffService.js
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

class VisualDiffService {
	/**
	 * Compare two screenshots (as Buffers) and return the diff analysis.
	 */
	static async compare(
		currentBuffer,
		baselineBuffer,
		options = { threshold: 0.1 },
	) {
		try {
			const img1 = PNG.sync.read(currentBuffer);
			const img2 = PNG.sync.read(baselineBuffer);

			if (img1.width !== img2.width || img1.height !== img2.height) {
				return {
					diffPixels: -1,
					diffPercentage: 100,
					hasLayoutShift: true,
				};
			}

			const { width, height } = img1;
			const diff = new PNG({ width, height });

			const diffPixels = pixelmatch(
				img1.data,
				img2.data,
				diff.data,
				width,
				height,
				{ threshold: options.threshold },
			);

			const diffPercentage = (diffPixels / (width * height)) * 100;

			// Generate Diff Image as Buffer (caller can converted to base64 if needed)
			const diffBuffer = PNG.sync.write(diff);

			return {
				diffPixels,
				diffPercentage,
				diffBuffer,
				hasLayoutShift: diffPercentage > 0.5,
			};
		} catch (error) {
			console.error("VisualDiffService Error:", error);
			return null;
		}
	}
}

export default VisualDiffService;
