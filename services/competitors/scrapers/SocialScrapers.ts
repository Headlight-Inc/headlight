import { CompetitorProfile } from "../../CompetitorMatrixConfig";
import { parseAbbreviatedNumber } from "./shared";

export async function scrapeYouTube(
	channelUrl: string | null,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	if (!channelUrl) return result;

	try {
		const html = await fetchFn(channelUrl);
		const subMatch =
			html.match(
				/"subscriberCountText"\s*:\s*\{"simpleText"\s*:\s*"([^"]+)"/i,
			) || html.match(/([\.\d,]+[KMB]?)\s*subscribers?/i);
		if (subMatch)
			result.youtubeSubscribers = parseAbbreviatedNumber(subMatch[1]);

		const videoMatch = html.match(/([\.\d,]+)\s*videos?/i);
		if (videoMatch)
			result.youtubeVideoCount = parseInt(videoMatch[1].replace(/,/g, ""), 10);

		const channelIdMatch = html.match(/"channelId"\s*:\s*"([^"]+)"/);
		if (channelIdMatch) {
			try {
				const rssHtml = await fetchFn(
					`https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdMatch[1]}`,
				);
				const publishDates = [
					...rssHtml.matchAll(/<published>([^<]+)<\/published>/g),
				]
					.map((m) => Date.parse(m[1]))
					.filter((d) => !Number.isNaN(d));
				if (publishDates.length >= 2) {
					const thirtyDaysAgo = Date.now() - 30 * 86400000;
					result.youtubeUpdatesPerMonth = publishDates.filter(
						(d) => d >= thirtyDaysAgo,
					).length;
				}
			} catch {
				// ignore rss fetch failure
			}
		}
	} catch (err) {
		console.warn("[YouTubeScraper] Failed:", err);
	}

	return result;
}

export async function scrapeTwitterViaNitter(
	twitterUrl: string | null,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	if (!twitterUrl) return result;

	const handle = twitterUrl.match(/(?:twitter|x)\.com\/([\w]+)/i)?.[1];
	if (!handle) return result;

	const nitterInstances = [
		"nitter.privacydev.net",
		"nitter.poast.org",
		"nitter.1d4.us",
	];
	for (const instance of nitterInstances) {
		try {
			const html = await fetchFn(`https://${instance}/${handle}`);
			const text = html.replace(/<[^>]+>/g, " ");
			const followersMatch = text.match(/([\.\d,]+[KMB]?)\s*Followers/i);
			if (followersMatch) {
				result.twitterFollowers = parseAbbreviatedNumber(followersMatch[1]);
				break;
			}
		} catch {
			continue;
		}
	}

	return result;
}

export async function scrapeInstagram(
	instagramUrl: string | null,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	if (!instagramUrl) return result;

	try {
		const html = await fetchFn(instagramUrl);
		const metaMatch = html.match(/([\.\d,]+[KMB]?)\s*Followers/i);
		if (metaMatch)
			result.instagramFollowers = parseAbbreviatedNumber(metaMatch[1]);

		const ogMatch = html.match(/content="([\.\d,]+[KMB]?)\s*Followers/i);
		if (ogMatch && !result.instagramFollowers) {
			result.instagramFollowers = parseAbbreviatedNumber(ogMatch[1]);
		}
	} catch (err) {
		console.warn("[InstagramScraper] Failed:", err);
	}

	return result;
}

export async function scrapeTikTok(
	tiktokUrl: string | null,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	if (!tiktokUrl) return result;

	try {
		const html = await fetchFn(tiktokUrl);
		const followerMatch =
			html.match(/"followerCount"\s*:\s*(\d+)/) ||
			html.match(/([\.\d,]+[KMB]?)\s*Followers/i);
		if (followerMatch)
			result.tiktokFollowers = parseAbbreviatedNumber(followerMatch[1]);
	} catch (err) {
		console.warn("[TikTokScraper] Failed:", err);
	}

	return result;
}
