import { CompetitorProfile } from '../CompetitorMatrixConfig';

export async function scrapeTrustpilot(domain: string): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const cleanDomain = domain.replace(/^www\./, '');
  const url = `https://www.trustpilot.com/review/${cleanDomain}`;

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return result;

    const html = await resp.text();
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(jsonStr);
          const rating = data.aggregateRating || data?.mainEntity?.aggregateRating;
          if (rating) {
            result.trustpilotScore = parseFloat(rating.ratingValue) || null;
            result.trustpilotReviewCount = parseInt(rating.reviewCount, 10) || null;
            break;
          }
        } catch {
          // skip malformed block
        }
      }
    }

    if (!result.trustpilotScore) {
      const ratingMatch = html.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/);
      const countMatch = html.match(/"reviewCount"\s*:\s*"?(\d+)"?/);
      if (ratingMatch) result.trustpilotScore = parseFloat(ratingMatch[1]);
      if (countMatch) result.trustpilotReviewCount = parseInt(countMatch[1], 10);
    }
  } catch {
    // ignore failures
  }

  return result;
}
