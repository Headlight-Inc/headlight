import { pipeline, env } from '@xenova/transformers';

// Disable fetching models from the Hugging Face Hub if we want to strictly use local/cached ones,
// but for first-time use in the browser, it needs to download the model into the browser cache.
env.allowLocalModels = false;
env.useBrowserCache = true;

class ContentScoringPipeline {
    static instance = null;
    static async getInstance(progressCallback) {
        if (this.instance === null) {
            // Use a lightweight feature-extraction or classification model
            // For intent/quality, a small embedding model like all-MiniLM-L6-v2 is fast
            this.instance = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                progress_callback: progressCallback
            });
        }
        return this.instance;
    }
}

// Basic sentiment pipeline
class SentimentPipeline {
    static instance = null;
    static async getInstance(progressCallback) {
        if (this.instance === null) {
            this.instance = pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
                progress_callback: progressCallback
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { id, text, url, type } = event.data;

    if (type === 'init') {
        try {
            self.postMessage({ status: 'init_start' });
            await ContentScoringPipeline.getInstance((x) => {
                self.postMessage({ status: 'progress', data: x });
            });
            await SentimentPipeline.getInstance((x) => {
                self.postMessage({ status: 'progress', data: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    if (type === 'score') {
        try {
            // Trim text to avoid overwhelming the model
            const maxChars = 1500;
            const snippet = text.length > maxChars ? text.substring(0, maxChars) : text;
            
            if (!snippet.trim()) {
                self.postMessage({ id, status: 'complete', result: { qualityScore: 0, sentiment: 'NEUTRAL' } });
                return;
            }

            const extractor = await ContentScoringPipeline.getInstance(() => {});
            const sentimentAnalyzer = await SentimentPipeline.getInstance(() => {});

            // 1. Generate an embedding to proxy "content depth/complexity"
            // For a real app, you'd compare this embedding against target keywords.
            // Here, we'll just extract features and calculate a basic magnitude as a dummy score,
            // or use it to determine 'intent'.
            const output = await extractor(snippet, { pooling: 'mean', normalize: true });
            
            // Generate a synthetic "quality score" based on embedding density and text length
            const embedding = Array.from(output.data) as number[];
            const qualityScore = Math.min(100, Math.round((snippet.length / maxChars) * 50 + (Math.abs(embedding[0] || 0) * 100)));

            // 2. Sentiment analysis (proxy for tone/engagement)
            const sentimentResult = await sentimentAnalyzer(snippet);
            const sentiment = sentimentResult[0]?.label || 'NEUTRAL';

            self.postMessage({
                id,
                status: 'complete',
                url,
                result: {
                    qualityScore,
                    sentiment,
                    intentMatch: qualityScore > 70 ? 'High' : qualityScore > 40 ? 'Medium' : 'Low'
                }
            });
        } catch (error) {
            self.postMessage({ id, status: 'error', url, error: error.message });
        }
    }
});
