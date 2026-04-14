import { CompetitorProfile } from '../../CompetitorMatrixConfig';
import { extractJsonLd } from './shared';

export async function scrapeG2(
  businessName: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const searchUrl = `https://www.g2.com/search?query=${encodeURIComponent(businessName)}`;

  try {
    const searchHtml = await fetchFn(searchUrl);
    const productMatch = searchHtml.match(/href="(\/products\/[^\"]+)"/i);
    if (!productMatch) return result;

    const productHtml = await fetchFn(`https://www.g2.com${productMatch[1]}`);
    const jsonLds = extractJsonLd(productHtml);
    for (const data of jsonLds) {
      const rating = data.aggregateRating;
      if (rating) {
        result.g2Rating = parseFloat(rating.ratingValue) || null;
        result.g2ReviewCount = parseInt(rating.reviewCount, 10) || null;
        break;
      }
    }

    if (!result.g2Rating) {
      const ratingMatch = productHtml.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/);
      const countMatch = productHtml.match(/"reviewCount"\s*:\s*"?(\d+)"?/);
      if (ratingMatch) result.g2Rating = parseFloat(ratingMatch[1]);
      if (countMatch) result.g2ReviewCount = parseInt(countMatch[1], 10);
    }
  } catch (err) {
    console.warn('[G2Scraper] Failed:', err);
  }

  return result;
}

export async function scrapeCapterra(
  businessName: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const searchUrl = `https://www.capterra.com/search/?search=${encodeURIComponent(businessName)}`;

  try {
    const searchHtml = await fetchFn(searchUrl);
    const productMatch = searchHtml.match(/href="(\/p\/[^\"]+)"/i);
    if (!productMatch) return result;

    const productHtml = await fetchFn(`https://www.capterra.com${productMatch[1]}`);
    const jsonLds = extractJsonLd(productHtml);
    for (const data of jsonLds) {
      const rating = data.aggregateRating;
      if (rating) {
        result.capterraRating = parseFloat(rating.ratingValue) || null;
        result.capterraReviewCount = parseInt(rating.reviewCount, 10) || null;
        break;
      }
    }
  } catch (err) {
    console.warn('[CapterraScraper] Failed:', err);
  }

  return result;
}

export async function scrapeGoogleReviews(
  businessName: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${businessName} reviews`)}`;

  try {
    const html = await fetchFn(searchUrl);
    const ratingMatch = html.match(/([\d.]+)\s*(?:out of 5)?[^\d]*?\(([\d,]+)\s*reviews?\)/i);
    if (ratingMatch) {
      result.googleReviewScore = parseFloat(ratingMatch[1]);
      result.googleReviewCount = parseInt(ratingMatch[2].replace(/,/g, ''), 10);
    }
  } catch (err) {
    console.warn('[GoogleReviewsScraper] Failed:', err);
  }

  return result;
}
