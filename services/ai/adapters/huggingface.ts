import { fetchWithRetry } from '../utils/fetchWithRetry';
import type { AIProviderAdapter, AIRequest, AIResponse } from '../types';

// HuggingFace Inference API — free rate-limited tier
export function createHuggingFaceAdapter(apiToken: string): AIProviderAdapter {
  return {
    provider: 'huggingface',
    async isAvailable() { return Boolean(apiToken); },
    async getQuotaRemaining() { return -1; },

    async complete(request: AIRequest): Promise<AIResponse> {
      const isEmbed = request.taskType === 'embed';
      const model = isEmbed 
        ? 'sentence-transformers/all-MiniLM-L6-v2'
        : 'mistralai/Mistral-7B-Instruct-v0.3';
      const start = Date.now();

      if (isEmbed) {
        const res = await fetchWithRetry(
          `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: request.prompt,
              options: { wait_for_model: true },
            }),
            timeout: 30000,
          }
        );

        if (!res.ok) throw new Error(`HuggingFace embed error ${res.status}`);
        const data = await res.json();
        const text = JSON.stringify(data);

        return {
          text,
          provider: 'huggingface',
          model,
          tokensUsed: request.prompt.length / 4,
          latencyMs: Date.now() - start,
          fromCache: false,
        };
      }

      const prompt = request.systemPrompt
        ? `<s>[INST] ${request.systemPrompt}\n\n${request.prompt} [/INST]`
        : `<s>[INST] ${request.prompt} [/INST]`;

      const res = await fetchWithRetry(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: request.maxTokens || 512,
              temperature: request.temperature ?? 0.3,
              return_full_text: false,
            },
          }),
          timeout: isEmbed ? 30000 : 15000,
        }
      );

      if (!res.ok) throw new Error(`HuggingFace error ${res.status}`);
      const data = await res.json();
      const text = Array.isArray(data)
        ? data[0]?.generated_text || ''
        : data.generated_text || '';

      return {
        text,
        provider: 'huggingface',
        model,
        tokensUsed: text.length / 4,
        latencyMs: Date.now() - start,
        fromCache: false,
      };
    },
  };
}
