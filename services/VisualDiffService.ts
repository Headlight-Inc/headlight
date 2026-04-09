// services/VisualDiffService.ts
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface VisualDiffResult {
    url: string;
    diffPixels: number;
    diffPercentage: number;
    diffImageUrl?: string; // Data URI for display
    hasLayoutShift: boolean;
}

class VisualDiffService {
    /**
     * Compare two screenshots (as Buffers) and return the diff analysis.
     */
    static async compare(currentBuffer: Buffer, baselineBuffer: Buffer, options = { threshold: 0.1 }): Promise<VisualDiffResult | null> {
        try {
            const img1 = PNG.sync.read(currentBuffer);
            const img2 = PNG.sync.read(baselineBuffer);
            
            if (img1.width !== img2.width || img1.height !== img2.height) {
                // Resize handling or just return layout shift true
                return {
                    url: '',
                    diffPixels: -1,
                    diffPercentage: 100,
                    hasLayoutShift: true
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
                { threshold: options.threshold }
            );

            const diffPercentage = (diffPixels / (width * height)) * 100;

            // Generate Diff Image as base64 for UI preview
            const diffBuffer = PNG.sync.write(diff);
            const diffImageUrl = `data:image/png;base64,${diffBuffer.toString('base64')}`;

            return {
                url: '',
                diffPixels,
                diffPercentage,
                diffImageUrl,
                hasLayoutShift: diffPercentage > 0.5 // Threshold for 'visible' shift
            };
        } catch (error) {
            console.error('VisualDiffService Error:', error);
            return null;
        }
    }

    /**
     * Quick check to see if two images are meaningfully different.
     */
    static isDifferent(diff: VisualDiffResult, threshold = 1.0): boolean {
        return diff.diffPercentage >= threshold;
    }
}

export default VisualDiffService;
