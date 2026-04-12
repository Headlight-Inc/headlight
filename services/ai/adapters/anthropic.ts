import { fetchWithRetry } from '../utils/fetchWithRetry';
import type { AIProviderAdapter, AIRequest, AIResponse } from '../types';

export function createAnthropicAdapter(apiKey: string): AIProviderAdapter {
  const MODEL_MAP: Record<string, string> = {
    classify:  'claude-3-haiku-20240307',
    summarize: 'claude-3-5-sonnet-20241022',
    extract:   'claude-3-haiku-20240307',
    generate:  'claude-3-5-sonnet-20241022',
    score:     'claude-3-haiku-20240307',
  };

  return {
    provider: 'anthropic',
    async isAvailable() { return Boolean(apiKey); },
    async getQuotaRemaining() { return -1; },
    async complete(request: AIRequest): Promise<AIResponse> {
      const model = MODEL_MAP[request.taskType] || MODEL_MAP.classify;
      const start = Date.now();
      const isEmbed = request.taskType === 'embed';

      const res = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: request.maxTokens || 512,
          system: request.systemPrompt || '',
          messages: [{ role: 'user', content: request.prompt }],
        }),
        timeout: isEmbed ? 30000 : 15000,
      });
      if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      return {
        text, provider: 'anthropic', model,
        tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        latencyMs: Date.now() - start, fromCache: false,
      };
    },
  };
}
