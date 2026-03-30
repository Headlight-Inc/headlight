type KeywordRecord = {
    id: string;
    project_id: string;
    keyword: string;
    intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational' | null;
    volume: number | null;
    kd: number | null;
    position: number | null;
    change: number | null;
    created_at: string;
};

type RankHistoryRecord = {
    keyword_id: string;
    position: number;
    date: string;
};

type CompetitorRecord = {
    id: string;
    project_id: string;
    name: string;
    url: string;
    score: number;
    keywords_count: number;
    domain_authority: number;
    created_at: string;
};

type AutomationRuleRecord = {
    id: string;
    project_id: string;
    name: string;
    trigger_condition: string;
    action: string;
    is_active: boolean;
    created_at: string;
};

type BrandMentionRecord = {
    id: string;
    project_id: string;
    type: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    text: string;
    source: string;
    detected_at: string;
    is_linkable: boolean;
};

type CollectionName = 'keywords' | 'rank_history' | 'competitors' | 'automation_rules' | 'brand_mentions';

const storageKey = (collection: CollectionName, projectId: string) => `headlight:data:${collection}:${projectId}`;

const readCollection = <T>(collection: CollectionName, projectId: string): T[] => {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(window.localStorage.getItem(storageKey(collection, projectId)) || '[]');
    } catch {
        return [];
    }
};

const writeCollection = <T>(collection: CollectionName, projectId: string, items: T[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey(collection, projectId), JSON.stringify(items));
};

const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const isoNow = () => new Date().toISOString();
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const listKeywords = async (projectId: string): Promise<KeywordRecord[]> => {
    return readCollection<KeywordRecord>('keywords', projectId).sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const addKeyword = async (
    projectId: string,
    keyword: string,
    overrides?: Partial<KeywordRecord>
): Promise<KeywordRecord> => {
    const item: KeywordRecord = {
        id: makeId('kw'),
        project_id: projectId,
        keyword,
        intent: overrides?.intent || 'Informational',
        volume: overrides?.volume ?? rand(200, 6000),
        kd: overrides?.kd ?? rand(20, 75),
        position: overrides?.position ?? rand(3, 55),
        change: overrides?.change ?? rand(-6, 6),
        created_at: isoNow()
    };
    const items = readCollection<KeywordRecord>('keywords', projectId);
    writeCollection('keywords', projectId, [item, ...items]);
    return item;
};

export const addKeywords = async (projectId: string, keywords: string[]) => {
    const created: KeywordRecord[] = [];
    for (const keyword of keywords) {
        created.push(await addKeyword(projectId, keyword));
    }
    return created;
};

export const refreshKeywordRanks = async (projectId: string) => {
    const keywords = readCollection<KeywordRecord>('keywords', projectId).map((kw) => {
        const nextPosition = Math.max(1, (kw.position || rand(5, 40)) + rand(-4, 4));
        const nextChange = (kw.position || nextPosition) - nextPosition;
        return {
            ...kw,
            position: nextPosition,
            change: nextChange
        };
    });
    writeCollection('keywords', projectId, keywords);

    const histories = readCollection<RankHistoryRecord>('rank_history', projectId);
    const today = new Date().toISOString().split('T')[0];
    const nextHistories = [
        ...histories,
        ...keywords.map((kw) => ({
            keyword_id: kw.id,
            position: kw.position || 0,
            date: today
        }))
    ];
    writeCollection('rank_history', projectId, nextHistories.slice(-500));
    return keywords;
};

export const listRankHistory = async (projectId: string, keywordId: string) => {
    return readCollection<RankHistoryRecord>('rank_history', projectId)
        .filter((item) => item.keyword_id === keywordId)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14);
};

export const listCompetitors = async (projectId: string): Promise<CompetitorRecord[]> => {
    return readCollection<CompetitorRecord>('competitors', projectId).sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const addCompetitor = async (projectId: string, name: string, url: string): Promise<CompetitorRecord> => {
    const item: CompetitorRecord = {
        id: makeId('comp'),
        project_id: projectId,
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        score: rand(40, 82),
        keywords_count: rand(500, 5500),
        domain_authority: rand(20, 70),
        created_at: isoNow()
    };
    const items = readCollection<CompetitorRecord>('competitors', projectId);
    writeCollection('competitors', projectId, [item, ...items]);
    return item;
};

export const deleteCompetitor = async (projectId: string, id: string) => {
    const items = readCollection<CompetitorRecord>('competitors', projectId).filter((item) => item.id !== id);
    writeCollection('competitors', projectId, items);
};

export const listAutomationRules = async (projectId: string): Promise<AutomationRuleRecord[]> => {
    return readCollection<AutomationRuleRecord>('automation_rules', projectId).sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const addAutomationRule = async (
    projectId: string,
    payload: Pick<AutomationRuleRecord, 'name' | 'trigger_condition' | 'action'>
): Promise<AutomationRuleRecord> => {
    const item: AutomationRuleRecord = {
        id: makeId('rule'),
        project_id: projectId,
        name: payload.name,
        trigger_condition: payload.trigger_condition,
        action: payload.action,
        is_active: true,
        created_at: isoNow()
    };
    const items = readCollection<AutomationRuleRecord>('automation_rules', projectId);
    writeCollection('automation_rules', projectId, [item, ...items]);
    return item;
};

export const updateAutomationRule = async (projectId: string, id: string, updates: Partial<AutomationRuleRecord>) => {
    const items = readCollection<AutomationRuleRecord>('automation_rules', projectId).map((item) => item.id === id ? { ...item, ...updates } : item);
    writeCollection('automation_rules', projectId, items);
};

export const deleteAutomationRule = async (projectId: string, id: string) => {
    const items = readCollection<AutomationRuleRecord>('automation_rules', projectId).filter((item) => item.id !== id);
    writeCollection('automation_rules', projectId, items);
};

export const listBrandMentions = async (projectId: string): Promise<BrandMentionRecord[]> => {
    return readCollection<BrandMentionRecord>('brand_mentions', projectId).sort((a, b) => b.detected_at.localeCompare(a.detected_at));
};

export const seedBrandMentions = async (projectId: string, brandName: string) => {
    const existing = readCollection<BrandMentionRecord>('brand_mentions', projectId);
    if (existing.length > 0) return existing;
    const seeded: BrandMentionRecord[] = [
        {
            id: makeId('mention'),
            project_id: projectId,
            type: 'Blog',
            sentiment: 'positive',
            text: `${brandName} was referenced as an emerging option in a comparison article.`,
            source: 'Growth Daily',
            detected_at: isoNow(),
            is_linkable: true
        },
        {
            id: makeId('mention'),
            project_id: projectId,
            type: 'Forum',
            sentiment: 'neutral',
            text: `${brandName} came up in a discussion about SEO workflows for small teams.`,
            source: 'Indie Makers',
            detected_at: new Date(Date.now() - 86400000).toISOString(),
            is_linkable: false
        }
    ];
    writeCollection('brand_mentions', projectId, seeded);
    return seeded;
};

export const getProjectMetrics = async (projectId: string) => {
    const keywords = await listKeywords(projectId);
    const mentions = await listBrandMentions(projectId);
    const avgPosition = keywords.length > 0
        ? keywords.filter((kw) => kw.position !== null).reduce((sum, kw) => sum + Number(kw.position || 0), 0) / Math.max(1, keywords.filter((kw) => kw.position !== null).length)
        : null;
    return {
        keywords,
        mentions,
        avgPosition,
        mentionCount: mentions.length
    };
};
