import { AIRouter } from './AIRouter';
import { AIAnalysisEngine } from './AIAnalysisEngine';
import { createLocalAdapter } from './adapters/local';
import { createCloudflareAdapter } from './adapters/cloudflare';
import { createGitHubAdapter } from './adapters/github';
import { createGeminiAdapter } from './adapters/gemini';
import { createGroqAdapter } from './adapters/groq';
import { createHuggingFaceAdapter } from './adapters/huggingface';
import { createAnthropicAdapter } from './adapters/anthropic';
import { createOpenAIAdapter } from './adapters/openai';
import { createServerProxyAdapter } from './adapters/serverProxy';
import { getCrawlerIntegrationSecret } from '../CrawlerSecretVault';

export type { AIProvider, AITaskType, AIRequest, AIResponse } from './types';
export { AIRouter } from './AIRouter';
export { AIAnalysisEngine } from './AIAnalysisEngine';

// ─── Singleton factory ──────────────────────────────
let _router: AIRouter | null = null;
let _engine: AIAnalysisEngine | null = null;

export function getAIRouter(): AIRouter {
  if (!_router) {
    _router = new AIRouter();

    // Always register local (always available, zero cost)
    _router.registerAdapter(createLocalAdapter());

    // Register cloud providers from env/settings
    const cfAccountId = import.meta.env.VITE_CF_ACCOUNT_ID;
    const cfApiToken = import.meta.env.VITE_CF_AI_TOKEN;
    if (cfAccountId && cfApiToken) {
      _router.registerAdapter(createCloudflareAdapter(cfAccountId, cfApiToken));
    }

    const ghToken = import.meta.env.VITE_GITHUB_MODELS_TOKEN;
    if (ghToken) {
      _router.registerAdapter(createGitHubAdapter(ghToken));
    }

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      _router.registerAdapter(createGeminiAdapter(geminiKey));
    }

    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqKey) {
      _router.registerAdapter(createGroqAdapter(groqKey));
    }

    const hfToken = import.meta.env.VITE_HF_TOKEN;
    if (hfToken) {
      _router.registerAdapter(createHuggingFaceAdapter(hfToken));
    }

    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || getCrawlerIntegrationSecret('global', 'anthropic')?.apiKey;
    if (anthropicKey) {
      _router.registerAdapter(createAnthropicAdapter(anthropicKey));
    }

    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || getCrawlerIntegrationSecret('global', 'openai')?.apiKey;
    if (openaiKey) {
      _router.registerAdapter(createOpenAIAdapter(openaiKey));
    }
  }
  return _router;
}

export function getAIEngine(): AIAnalysisEngine {
  if (!_engine) {
    _engine = new AIAnalysisEngine(getAIRouter());
  }
  return _engine;
}

// Allow runtime registration (from user settings UI)
export function registerUserProvider(
  provider: 'openai' | 'anthropic',
  apiKey: string
) {
  // For paid providers the user optionally connects
  const router = getAIRouter();
  if (provider === 'openai') {
    router.registerAdapter(createOpenAIAdapter(apiKey));
  }
  if (provider === 'anthropic') {
    const adapter = createAnthropicAdapter(apiKey);
    router.registerAdapter(adapter);
  }
}
