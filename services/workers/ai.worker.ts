import { pipeline, env } from '@xenova/transformers';

// Skip local check to download from Hugging Face if not cached
env.allowLocalModels = false;
env.useBrowserCache = true;

let embeddingPipeline: any = null;

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    try {
        if (type === 'INIT') {
            if (!embeddingPipeline) {
                embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                self.postMessage({ type: 'INIT_COMPLETE' });
            }
        } else if (type === 'GET_EMBEDDINGS') {
            if (!embeddingPipeline) {
                embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            }
            
            const output = await embeddingPipeline(payload.text, {
                pooling: 'mean',
                normalize: true
            });
            
            self.postMessage({ 
                type: 'EMBEDDINGS_RESULT', 
                payload: { 
                    id: payload.id, 
                    embeddings: Array.from(output.data) 
                } 
            });
        }
    } catch (error: any) {
        self.postMessage({ type: 'ERROR', payload: error.message });
    }
};
