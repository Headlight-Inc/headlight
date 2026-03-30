import { CrawlerIntegrationProvider } from './CrawlerIntegrationsService';

type SecretRecord = Record<string, string>;

const secretVault = new Map<string, SecretRecord>();

const buildKey = (scope: string, provider: CrawlerIntegrationProvider) => `${scope}:${provider}`;

export const getCrawlerSecretScope = (projectId?: string | null) => projectId || 'anonymous';

export const storeCrawlerIntegrationSecret = (
    scope: string,
    provider: CrawlerIntegrationProvider,
    credentials?: Record<string, string>
) => {
    if (!credentials || Object.keys(credentials).length === 0) return;
    secretVault.set(buildKey(scope, provider), { ...credentials });
};

export const mergeCrawlerIntegrationSecret = (
    scope: string,
    provider: CrawlerIntegrationProvider,
    credentials?: Record<string, string>
) => {
    if (!credentials || Object.keys(credentials).length === 0) return;
    const key = buildKey(scope, provider);
    secretVault.set(key, { ...(secretVault.get(key) || {}), ...credentials });
};

export const getCrawlerIntegrationSecret = (
    scope: string,
    provider: CrawlerIntegrationProvider
): SecretRecord => {
    return { ...(secretVault.get(buildKey(scope, provider)) || {}) };
};

export const clearCrawlerIntegrationSecret = (scope: string, provider: CrawlerIntegrationProvider) => {
    secretVault.delete(buildKey(scope, provider));
};

export const clearCrawlerIntegrationSecretsForScope = (scope: string) => {
    for (const key of secretVault.keys()) {
        if (key.startsWith(`${scope}:`)) {
            secretVault.delete(key);
        }
    }
};
