/**
 * UrlTemplateGrouper.ts
 *
 * Groups URLs by path template. Replaces dynamic segments (ids, slugs)
 * with `:param` so /blog/my-post and /blog/other-post collapse to /blog/:slug.
 */

function tokenizeSegment(seg: string): 'id' | 'date' | 'uuid' | 'slug' | 'static' {
  if (/^\d+$/.test(seg)) return 'id';
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(seg)) return 'date';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) return 'uuid';
  if (seg.length > 20 && /-/.test(seg)) return 'slug';
  return 'static';
}

export function extractUrlTemplate(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const tokens = segments.map((seg) => {
      const type = tokenizeSegment(seg);
      if (type === 'static') return seg;
      return `:${type}`;
    });
    return '/' + tokens.join('/');
  } catch {
    return url;
  }
}

export interface UrlTemplateGroup {
  template: string;
  count: number;
  urls: string[];
  avgPageValue: number;
  totalImpressions: number;
  totalSessions: number;
}

export function groupByUrlTemplate(pages: any[]): UrlTemplateGroup[] {
  const groups = new Map<string, UrlTemplateGroup>();

  for (const p of pages) {
    const template = extractUrlTemplate(p.url);
    if (!groups.has(template)) {
      groups.set(template, {
        template, count: 0, urls: [], avgPageValue: 0,
        totalImpressions: 0, totalSessions: 0,
      });
    }
    const g = groups.get(template)!;
    g.count += 1;
    g.urls.push(p.url);
    g.avgPageValue += Number(p.pageValue || 0);
    g.totalImpressions += Number(p.gscImpressions || 0);
    g.totalSessions += Number(p.ga4Sessions || 0);
  }

  for (const g of groups.values()) {
    g.avgPageValue = g.count > 0 ? Math.round(g.avgPageValue / g.count) : 0;
  }

  return Array.from(groups.values())
    .filter((g) => g.count >= 2) // only show templates with 2+ pages
    .sort((a, b) => b.count - a.count);
}
