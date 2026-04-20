// services/TechDebtService.ts

export interface TechDebtBreakdown {
	score: number;
	grade: "A" | "B" | "C" | "D" | "F";
	factors: Array<{
		label: string;
		impact: number;
		description: string;
		type: "critical" | "moderate" | "low";
	}>;
}

class TechDebtService {
	static calculate(pages: any[]): TechDebtBreakdown {
		if (!pages.length) return { score: 0, grade: "A", factors: [] };

		const factors: Array<{
			label: string;
			impact: number;
			description: string;
			type: "critical" | "moderate" | "low";
		}> = [];
		let totalImpact = 0;

		// 1. Legacy Image Formats
		const legacyImages = pages.reduce(
			(acc, p) => acc + (p.legacyFormatImages || 0),
			0,
		);
		if (legacyImages > 0) {
			const impact = Math.min(
				15,
				Math.round((legacyImages / pages.length) * 10),
			);
			factors.push({
				label: "Legacy Image Formats",
				impact,
				description: `${legacyImages} images using png/jpg instead of WebP/Avif`,
				type: impact > 10 ? "moderate" : "low",
			});
			totalImpact += impact;
		}

		// 2. DOM Complexity
		const highDomPages = pages.filter((p) => p.domNodeCount > 3000).length;
		if (highDomPages > 0) {
			const impact = Math.min(
				20,
				Math.round((highDomPages / pages.length) * 50),
			);
			factors.push({
				label: "DOM Complexity",
				impact,
				description: `${highDomPages} pages with excessively large DOM trees (>3000 nodes)`,
				type: impact > 10 ? "critical" : "moderate",
			});
			totalImpact += impact;
		}

		// 3. JS Hydration Dependency (E2 Integration)
		const hydrationIssues = pages.filter(
			(p) => p.jsRenderDiff?.criticalContentJsOnly,
		).length;
		if (hydrationIssues > 0) {
			const impact = Math.min(
				25,
				Math.round((hydrationIssues / pages.length) * 100),
			);
			factors.push({
				label: "JS Hydration Debt",
				impact,
				description: `${hydrationIssues} pages hiding critical content behind JavaScript`,
				type: "critical",
			});
			totalImpact += impact;
		}

		// 4. Missing Security Headers
		const missingSecurity = pages.filter((p) => !p.hasCsp || !p.hasHsts).length;
		if (missingSecurity > 0) {
			const impact = Math.min(
				10,
				Math.round((missingSecurity / pages.length) * 10),
			);
			factors.push({
				label: "Security Header Debt",
				impact,
				description: `${missingSecurity} pages missing CSP or HSTS headers`,
				type: "low",
			});
			totalImpact += impact;
		}

		const score = Math.max(0, 100 - totalImpact);
		let grade: "A" | "B" | "C" | "D" | "F" = "A";
		if (score < 40) grade = "F";
		else if (score < 60) grade = "D";
		else if (score < 75) grade = "C";
		else if (score < 90) grade = "B";

		return { score, grade, factors };
	}
}

export default TechDebtService;
