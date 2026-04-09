export type ChatQueryType =
  | 'filter'
  | 'explain'
  | 'compare'
  | 'suggest'
  | 'generate'
  | 'navigate'
  | 'data'
  | 'report';

export interface ChatAction {
  label: string;
  type: 'open_page' | 'open_audit_tab' | 'open_settings' | 'set_search';
  payload?: any;
}

export interface QueryResult {
  type: ChatQueryType;
  handledLocally: boolean;
  response: string;
  matches?: any[];
  actions?: ChatAction[];
}

const lower = (value: string) => value.toLowerCase().trim();

const hasAny = (message: string, phrases: string[]) => phrases.some((phrase) => message.includes(phrase));

export class CrawlDataQueryEngine {
  static detectIntent(message: string): ChatQueryType {
    const query = lower(message);
    if (hasAny(query, ['open settings', 'go to settings', 'show settings'])) return 'navigate';
    if (hasAny(query, ['show me', 'find pages', 'pages with', 'which pages'])) return 'filter';
    if (hasAny(query, ['how many', 'count', 'how much'])) return 'data';
    if (hasAny(query, ['why did', 'why is', 'explain'])) return 'explain';
    if (hasAny(query, ['compare', 'difference'])) return 'compare';
    if (hasAny(query, ['what should i fix', 'priority', 'best roi'])) return 'suggest';
    if (hasAny(query, ['write meta', 'generate meta', 'generate content'])) return 'generate';
    return 'report';
  }

  static execute(message: string, pages: any[], context?: { crawlHistory?: any[]; healthScore?: number }): QueryResult {
    const query = lower(message);
    const intent = this.detectIntent(query);

    if (intent === 'navigate') {
      return {
        type: 'navigate',
        handledLocally: true,
        response: 'Settings is the right place for crawl configuration, API keys, storage, and monitoring preferences.',
        actions: [{ label: 'Open Settings', type: 'open_settings' }]
      };
    }

    if (hasAny(query, ['without meta descriptions', 'missing meta descriptions', 'no meta description'])) {
      const matches = pages.filter((page) => !page.metaDesc);
      return this.pageListResult('Pages without meta descriptions', matches, 'issues');
    }

    if (hasAny(query, ['without schema', 'no schema'])) {
      const matches = pages.filter((page) => !Array.isArray(page.schemaTypes) || page.schemaTypes.length === 0);
      return this.pageListResult('Pages without schema', matches, 'issues');
    }

    if (hasAny(query, ['googlebot', 'bot visits'])) {
      const matches = [...pages]
        .filter((page) => (page.googlebotVisits30d || 0) > 0)
        .sort((a, b) => (b.googlebotVisits30d || 0) - (a.googlebotVisits30d || 0))
        .slice(0, 10);
      return {
        type: 'data',
        handledLocally: true,
        response: matches.length
          ? `Top Googlebot-visited pages: ${matches.map((page) => `${page.url} (${page.googlebotVisits30d} visits)`).join('; ')}`
          : 'No Googlebot visit data is loaded yet. Upload access logs in the Log Analysis panel first.',
        matches,
        actions: matches.length ? [
          { label: 'Open Log Analysis', type: 'open_audit_tab', payload: 'logs' },
          { label: 'Open First Page', type: 'open_page', payload: matches[0].url }
        ] : [{ label: 'Open Log Analysis', type: 'open_audit_tab', payload: 'logs' }]
      };
    }

    if (hasAny(query, ['ai search', 'geo', 'optimized for ai'])) {
      const matches = [...pages]
        .filter((page) => typeof page.geoScore === 'number')
        .sort((a, b) => (b.geoScore || 0) - (a.geoScore || 0))
        .slice(0, 10);
      return {
        type: 'report',
        handledLocally: true,
        response: matches.length
          ? `Highest GEO scores: ${matches.map((page) => `${page.url} (${page.geoScore})`).join('; ')}`
          : 'No GEO scoring is available yet for this crawl.',
        matches,
        actions: [{ label: 'Open GEO Panel', type: 'open_audit_tab', payload: 'geo' }]
      };
    }

    const scoreMatch = query.match(/score (below|under|less than) (\d{1,3})/);
    if (scoreMatch) {
      const threshold = Number(scoreMatch[2]);
      let matches = pages.filter((page) => Number(page.healthScore || page.priorityScore || 0) < threshold);
      const impressionsMatch = query.match(/(\d+)\s+impressions/);
      if (impressionsMatch) {
        const minImpressions = Number(impressionsMatch[1]);
        matches = matches.filter((page) => Number(page.gscImpressions || 0) > minImpressions);
      }
      return this.pageListResult(`Pages below score ${threshold}`, matches, 'issues');
    }

    if (intent === 'suggest') {
      const matches = [...pages]
        .sort((a, b) => (Number(b.opportunityScore || b.geoScore || 0) - Number(a.opportunityScore || a.geoScore || 0)))
        .slice(0, 5);
      return {
        type: 'suggest',
        handledLocally: true,
        response: matches.length
          ? `Best ROI opportunities right now: ${matches.map((page) => `${page.url} (opportunity ${page.opportunityScore || 0}, score ${page.healthScore || 0})`).join('; ')}`
          : 'No prioritized opportunity data is available for this crawl yet.',
        matches,
        actions: matches.length ? [{ label: 'Open First Opportunity', type: 'open_page', payload: matches[0].url }] : []
      };
    }

    if (intent === 'data') {
      return {
        type: 'data',
        handledLocally: true,
        response: `This crawl has ${pages.length} pages, ${pages.filter((page) => !page.metaDesc).length} pages missing meta descriptions, ${pages.filter((page) => !page.title).length} pages missing titles, and ${pages.filter((page) => (page.geoScore || 0) >= 70).length} pages with GEO score 70+.`
      };
    }

    return {
      type: intent,
      handledLocally: false,
      response: ''
    };
  }

  private static pageListResult(label: string, matches: any[], auditTab: string): QueryResult {
    return {
      type: 'filter',
      handledLocally: true,
      response: matches.length
        ? `${label}: ${matches.length} matches. Top results: ${matches.slice(0, 8).map((page) => page.url).join('; ')}`
        : `No matches found for ${label.toLowerCase()}.`,
      matches,
      actions: matches.length ? [
        { label: 'Open Audit Panel', type: 'open_audit_tab', payload: auditTab },
        { label: 'Open First Match', type: 'open_page', payload: matches[0].url },
        { label: 'Search First URL', type: 'set_search', payload: matches[0].url }
      ] : [{ label: 'Open Audit Panel', type: 'open_audit_tab', payload: auditTab }]
    };
  }
}

export default CrawlDataQueryEngine;
