import { crawlDb, getHtmlPages, type CrawledPage } from "./CrawlDatabase";

export interface GbpLocation {
	locationId: string;
	name: string;
	address: string;
	phone: string;
	websiteUri: string;
	categories: string[];
	regularHours: string;
	totalReviewCount: number;
	averageRating: number;
}

export interface GbpReview {
	author: string;
	rating: number;
	text: string;
	createTime: string;
	updateTime: string;
}

/**
 * Note: The Google Business Profile API requires the 'https://www.googleapis.com/auth/business.manage' scope.
 */
export class GoogleBusinessProfileService {
	private static BIZ_INFO_BASE =
		"https://mybusinessbusinessinformation.googleapis.com/v1";
	private static MY_BIZ_BASE = "https://mybusiness.googleapis.com/v4";

	/**
	 * 1. listLocations: Fetch all locations accessible by the user's token
	 */
	static async listLocations(accessToken: string): Promise<GbpLocation[]> {
		try {
			// Get Accounts
			const accRes = await fetch(`${this.BIZ_INFO_BASE}/accounts`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (!accRes.ok) return [];
			const accData = await accRes.json();
			const accounts = accData.accounts || [];

			const allLocations: GbpLocation[] = [];

			// Get Locations for each account
			for (const account of accounts) {
				const locRes = await fetch(
					`${this.BIZ_INFO_BASE}/${account.name}/locations?readMask=name,title,storefrontAddress,primaryPhone,websiteUri,regularHours,categories,metadata`,
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);
				if (!locRes.ok) continue;
				const locData = await locRes.json();
				const locations = locData.locations || [];

				locations.forEach((loc: any) => {
					allLocations.push({
						locationId: loc.name,
						name: loc.title,
						address: loc.storefrontAddress
							? `${loc.storefrontAddress.addressLines?.join(", ") || ""}, ${loc.storefrontAddress.locality || ""}, ${loc.storefrontAddress.administrativeArea || ""} ${loc.storefrontAddress.postalCode || ""}`
							: "",
						phone: loc.primaryPhone || "",
						websiteUri: loc.websiteUri || "",
						categories:
							loc.categories?.additionalCategories?.map(
								(c: any) => c.displayName,
							) ||
							[loc.categories?.primaryCategory?.displayName].filter(Boolean),
						regularHours: JSON.stringify(loc.regularHours || {}),
						totalReviewCount: 0,
						averageRating: 0,
					});
				});
			}

			return allLocations;
		} catch (err) {
			console.error("[GBP] Failed to list locations:", err);
			return [];
		}
	}

	/**
	 * 2. matchLocationToSite: Match a GBP location to the current crawl domain
	 */
	static matchLocationToSite(
		locations: GbpLocation[],
		crawlDomain: string,
	): GbpLocation | null {
		return (
			locations.find((loc) => {
				if (!loc.websiteUri) return false;
				try {
					const locDomain = new URL(loc.websiteUri).hostname.replace(
						/^www\./,
						"",
					);
					return locDomain === crawlDomain;
				} catch {
					return false;
				}
			}) || null
		);
	}

	/**
	 * 3. getReviews: Fetch latest reviews for a specific location
	 */
	static async getReviews(
		accountId: string,
		locationId: string,
		accessToken: string,
	): Promise<GbpReview[]> {
		try {
			const response = await fetch(
				`${this.MY_BIZ_BASE}/${accountId}/locations/${locationId}/reviews?pageSize=50`,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);
			if (!response.ok) return [];
			const data = await response.json();
			return (data.reviews || []).map((r: any) => ({
				author: r.reviewer?.displayName,
				rating:
					r.starRating === "FIVE"
						? 5
						: r.starRating === "FOUR"
							? 4
							: r.starRating === "THREE"
								? 3
								: r.starRating === "TWO"
									? 2
									: 1,
				text: r.comment,
				createTime: r.createTime,
				updateTime: r.updateTime,
			}));
		} catch (err) {
			console.error("[GBP] Failed to fetch reviews:", err);
			return [];
		}
	}

	/**
	 * 4. enrichSession: Main entry point for local SEO enrichment
	 */
	static async enrichSession(
		sessionId: string,
		accessToken: string,
		crawlDomain: string,
		onProgress?: (msg: string) => void,
	): Promise<{ enriched: boolean; location?: GbpLocation }> {
		const locations = await this.listLocations(accessToken);
		const match = this.matchLocationToSite(locations, crawlDomain);

		if (!match) return { enriched: false };

		onProgress?.(`Found matching Google Business Profile: ${match.name}`);

		// Store location data to the homepage
		const htmlPages = await getHtmlPages(sessionId);
		const homePage = htmlPages.find((p) => p.crawlDepth === 0) || htmlPages[0];

		if (homePage) {
			await crawlDb.pages.update(homePage.url, {
				gbpName: match.name,
				gbpAddress: match.address,
				gbpPhone: match.phone,
				gbpCategories: match.categories,
				gbpHours: match.regularHours,
				gbpReviewCount: match.totalReviewCount,
				gbpAvgRating: match.averageRating,
				gbpEnrichedAt: Date.now(),
			});
		}

		return { enriched: true, location: match };
	}
}
