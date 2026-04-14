import { CompetitorProfile } from '../../CompetitorMatrixConfig';
import { sleep } from './shared';

export async function scrapeGoogleSiteCount(
  domain: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const url = `https://www.google.com/search?q=site:${encodeURIComponent(domain)}`;

  try {
    const html = await fetchFn(url);
    const countMatch = html.match(/About ([\d,]+) results/i) || html.match(/([\d,]+) results/i);
    if (countMatch) result.googleIndexedPages = parseInt(countMatch[1].replace(/,/g, ''), 10);
  } catch {
    // ignore
  }

  return result;
}

export async function checkKnowledgePanel(
  businessName: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  try {
    const html = await fetchFn(`https://www.google.com/search?q=${encodeURIComponent(businessName)}`);
    result.hasKnowledgePanel = html.includes('kp-wholepage') || html.includes('knowledge-panel') || html.includes('kno-result') || html.includes('"knowledgePanelData"');
  } catch {
    // ignore
  }
  return result;
}

export async function checkLocalRanking(
  businessName: string,
  businessType: string,
  city: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  try {
    const html = await fetchFn(`https://www.google.com/search?q=${encodeURIComponent(`${businessType} ${city}`)}`);
    const results = html.match(/<h3[^>]*>([^<]+)<\/h3>/g) || [];
    const name = businessName.toLowerCase();
    for (let i = 0; i < results.length; i++) {
      if (results[i].toLowerCase().includes(name)) {
        result.localKeywordRanking = i + 1;
        break;
      }
    }
  } catch {
    // ignore
  }
  return result;
}

export async function checkPressCoverage(
  businessName: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  try {
    const html = await fetchFn(`https://www.google.com/search?q=${encodeURIComponent(`"${businessName}"`)}&tbm=nws`);
    result.localPressCoverage = !html.includes('did not match any documents') && !html.includes('No results found');
  } catch {
    // ignore
  }
  return result;
}

export async function checkDirectoryCitations(
  businessName: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const directories = ['yelp.com', 'bbb.org', 'yellowpages.com'];
  let found = 0;

  for (const dir of directories) {
    try {
      const url = `https://www.google.com/search?q=site:${dir}+"${encodeURIComponent(businessName)}"`;
      const html = await fetchFn(url);
      if (!html.includes('did not match any documents') && !html.includes('No results found')) found++;
      await sleep(2000);
    } catch {
      // continue
    }
  }

  result.qualityCitationsPresent = found >= 2;
  return result;
}
