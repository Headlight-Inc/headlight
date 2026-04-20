export function formatCompact(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
}

export function formatCat(cat: string): string {
	const map: Record<string, string> = {
		product: "Product",
		blog_post: "Blog",
		category: "Category",
		landing_page: "Landing",
		service_page: "Service",
		homepage: "Home",
		about_legal: "About",
		faq_help: "FAQ",
		resource: "Resource",
		login_account: "Login",
		pagination: "Pagination",
		media: "Media",
		other: "Other",
	};

	return map[cat] || cat || "Other";
}

export function formatIndustryLabel(industry: string): string {
	const labels: Record<string, string> = {
		ecommerce: "E-commerce",
		news: "News / Magazine",
		blog: "Blog / Content",
		local: "Local Business",
		saas: "SaaS",
		healthcare: "Healthcare",
		finance: "Finance",
		education: "Education",
		real_estate: "Real Estate",
		restaurant: "Restaurant",
		portfolio: "Portfolio",
		job_board: "Job Board",
		general: "General",
	};

	return labels[industry] || "General";
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function formatDate(dateStr: string): string {
	try {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			year: "numeric",
		});
	} catch {
		return dateStr;
	}
}

export function formatAge(dateStr: string): string {
	try {
		const days = Math.floor(
			(Date.now() - new Date(dateStr).getTime()) / 86_400_000,
		);
		if (days < 7) return "This week";
		if (days < 30) return `${Math.round(days / 7)}w ago`;
		if (days < 180) return `${Math.round(days / 30)}mo ago`;
		if (days < 365) return `${Math.round(days / 30)}mo ago (aging)`;
		return `${Math.round(days / 365)}yr ago (stale)`;
	} catch {
		return "—";
	}
}

export function tryPath(url: string): string {
	try {
		return new URL(url).pathname;
	} catch {
		return url;
	}
}

export function num(v: any): number {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

export function shortenAction(action: string): string {
	const map: Record<string, string> = {
		"Rewrite Title & Meta": "Rewrite T&M",
		"Recover Declining Content": "Recover Decl.",
		"Restore Broken Page": "Fix Broken",
		"Expand Thin Content": "Expand Thin",
		"Update Stale Content": "Update Stale",
		"Unblock From Index": "Fix Indexing",
		"Fill Content Gap": "Content Gaps",
		"Fix Redirect Chain": "Fix Redirects",
		"Consolidate Duplicates": "Merge Dupes",
		"Remove Dead Page": "Remove Dead",
		"Optimize for SERP Features": "SERP Optimize",
		"Resolve Cannibalization": "Fix Cannib.",
	};

	return map[action] || action;
}
