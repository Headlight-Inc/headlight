import type { AIProviderAdapter, AIRequest, AIResponse } from '../types';

export function createAnthropicAdapter(apiKey: string): AIProviderAdapter {
  return {
    provider: 'anthropic',
    async isAvailable() { return Boolean(apiKey); },
    async getQuotaRemaining() { return -1; },
    async complete(request: AIRequest): Promise<AIResponse> {
      const model = 'claude-3-haiku-20240307'; // cheapest/fastest
      const start = Date.now();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
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
