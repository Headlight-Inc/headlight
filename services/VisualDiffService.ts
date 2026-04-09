// services/VisualDiffService.ts

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
            const totalBytes = Math.max(currentBuffer.length, baselineBuffer.length, 1);
            const compareLength = Math.min(currentBuffer.length, baselineBuffer.length);
            let diffBytes = 0;

            for (let i = 0; i < compareLength; i++) {
                if (currentBuffer[i] !== baselineBuffer[i]) diffBytes++;
            }

            diffBytes += Math.abs(currentBuffer.length - baselineBuffer.length);
            const thresholdMultiplier = Math.max(0.1, options.threshold || 0.1);
            const diffPercentage = (diffBytes / totalBytes) * 100;
            const adjustedDiff = diffPercentage * thresholdMultiplier;

            return {
                url: '',
                diffPixels: diffBytes,
                diffPercentage: Number(adjustedDiff.toFixed(3)),
                hasLayoutShift: adjustedDiff > 0.5
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
