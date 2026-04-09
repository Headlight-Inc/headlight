// server/aiGateway.js
// Server-side AI gateway — mirrors client AIRouter but for Node.js
// Providers: Gemini (primary), Groq, HuggingFace, Cloudflare
// Falls back to heuristic if all providers fail

import { request as undiciRequest } from 'undici';

const PROVIDERS = [
  {
    name: 'gemini',
    envKey: 'GEMINI_API_KEY',
    rpm: 15,
    endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    buildBody: (prompt, systemPrompt, maxTokens) => ({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      generationConfig: { maxOutputTokens: maxTokens || 512, temperature: 0.3 }
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  },
  {
    name: 'groq',
    envKey: 'GROQ_API_KEY',
    rpm: 30,
    endpoint: () => 'https://api.groq.com/openai/v1/chat/completions',
    buildBody: (prompt, systemPrompt, maxTokens) => ({
      model: 'llama-3.1-8b-instant',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens || 512,
      temperature: 0.3
    }),
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  {
    name: 'github',
    envKey: 'GITHUB_MODELS_TOKEN',
    rpm: 15,
    endpoint: () => 'https://models.inference.ai.azure.com/chat/completions',
    buildBody: (prompt, systemPrompt, maxTokens) => ({
      model: 'gpt-4o-mini',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens || 512,
      temperature: 0.3
    }),
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  {
    name: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    rpm: 10,
    endpoint: () => 'https://api.anthropic.com/v1/messages',
    buildBody: (prompt, systemPrompt, maxTokens) => ({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: maxTokens || 1024,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: prompt }]
    }),
    buildHeaders: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    parseResponse: (data) => data.content?.[0]?.text || ''
  },
  {
    name: 'huggingface',
    envKey: 'HF_TOKEN',
    rpm: 10,
    endpoint: () => 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
    buildBody: (prompt, systemPrompt) => ({
      inputs: systemPrompt ? `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]` : `<s>[INST] ${prompt} [/INST]`,
      parameters: { max_new_tokens: 512, temperature: 0.3, return_full_text: false }
    }),
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    parseResponse: (data) => Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || ''
  }
];

// Track rate limits per provider
const usageTracker = new Map(); // provider -> { minute: timestamp, count: number }

function isWithinRateLimit(provider) {
  const tracker = usageTracker.get(provider.name);
  if (!tracker) return true;
  if (Date.now() - tracker.minute > 60000) {
    usageTracker.set(provider.name, { minute: Date.now(), count: 0 });
    return true;
  }
  return tracker.count < provider.rpm;
}

function recordUsage(providerName) {
  const tracker = usageTracker.get(providerName) || { minute: Date.now(), count: 0 };
  if (Date.now() - tracker.minute > 60000) {
    tracker.minute = Date.now();
    tracker.count = 0;
  }
  tracker.count++;
  usageTracker.set(providerName, tracker);
}

export async function completeAI({ prompt, systemPrompt, maxTokens, format }) {
  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) continue;
    if (!isWithinRateLimit(provider)) continue;

    try {
      const url = provider.endpoint(apiKey);
      const body = provider.buildBody(prompt, systemPrompt, maxTokens);
      const headers = provider.buildHeaders
        ? provider.buildHeaders(apiKey)
        : { 'Content-Type': 'application/json' };

      const { statusCode, body: resBody } = await undiciRequest(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        headersTimeout: 15000,
        bodyTimeout: 30000
      });

      const data = await resBody.json();
      if (statusCode !== 200) {
        console.warn(`[AI:${provider.name}] status ${statusCode}`);
        continue;
      }

      recordUsage(provider.name);
      const text = provider.parseResponse(data);
      if (!text) continue;

      // If JSON format requested, try to extract JSON
      let result = text;
      if (format === 'json') {
        const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
        const candidate = fenced?.[1]?.trim() || text.trim();
        const arrayMatch = candidate.match(/\[[\s\S]*\]/);
        const objectMatch = candidate.match(/\{[\s\S]*\}/);
        result = (arrayMatch?.[0] || objectMatch?.[0] || candidate).trim();
      }
      return { text: result, provider: provider.name };
    } catch (err) {
      console.warn(`[AI:${provider.name}] error: ${err.message}`);
      continue;
    }
  }
  return { text: '' }; // All providers failed
}

// Batch helper with rate limit delays
export async function aiBatch(requests, concurrency = 2) {
  const results = [];
  for (let i = 0; i < requests.length; i += concurrency) {
    const chunk = requests.slice(i, i + concurrency);
    const chunkResults = await Promise.allSettled(
      chunk.map(req => completeAI(req))
    );
    results.push(...chunkResults.map(r => r.status === 'fulfilled' ? r.value : null));
    if (i + concurrency < requests.length) {
      await new Promise(r => setTimeout(r, 500)); // Rate limit pause
    }
  }
  return results;
}
