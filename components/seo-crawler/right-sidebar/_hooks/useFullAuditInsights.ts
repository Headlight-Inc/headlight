import { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { safePct } from '../_shared/format'

const num = (v: any) => {
	const n = Number(v)
	return Number.isFinite(n) ? n : 0
}

function percentile(values: number[], p: number) {
	if (!values.length) return 0
	const sorted = [...values].sort((a, b) => a - b)
	const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
	return sorted[i]
}

function last<T>(arr: T[] | undefined, n: number, fallback: T): T[] {
	if (!arr || !arr.length) return new Array(n).fill(fallback)
	return arr.slice(-n)
}

export function useFullAuditInsights() {
	const crawler = useSeoCrawler() as any
	const pages: any[] = crawler.pages || []
	const crawlHistory: any[] = crawler.crawlHistory || []
	const compareSession = crawler.compareSession
	const prev: any[] = compareSession?.pages || []

	return useMemo(() => {
		const total = pages.length
		const html = pages.filter((p) => p.isHtmlPage).length || total

		// status
		const status = {
			ok: pages.filter((p) => p.statusCode >= 200 && p.statusCode < 300).length,
			redirect: pages.filter((p) => p.statusCode >= 300 && p.statusCode < 400).length,
			client: pages.filter((p) => p.statusCode >= 400 && p.statusCode < 500).length,
			server: pages.filter((p) => p.statusCode >= 500).length,
			blocked: pages.filter((p) => p.status === 'Blocked by Robots.txt').length,
		}

		// issues counts
		const notIndexable = pages.filter((p) => p.indexable === false).length
		const canonicalMismatch = pages.filter((p) => p.canonical && p.canonical !== p.url).length
		const missingTitle = pages.filter((p) => !p.title).length
		const missingMeta = pages.filter((p) => !p.metaDesc).length
		const missingH1 = pages.filter((p) => !p.h1_1).length
		const thin = pages.filter((p) => num(p.wordCount) > 0 && num(p.wordCount) < 300).length
		const duplicates = pages.filter((p) => p.exactDuplicate).length
		const missingAlt = pages.filter((p) => num(p.missingAltImages) > 0).length
		const schemaErr = pages.filter((p) => num(p.schemaErrors) > 0).length
		const lcpFail = pages.filter((p) => num(p.lcp) > 2.5 || num(p.lcpMs) > 2500).length
		const clsFail = pages.filter((p) => num(p.cls) > 0.1).length
		const inpFail = pages.filter((p) => num(p.inp) > 200 || num(p.fidMs) > 100).length
		const ttfbFail = pages.filter((p) => num(p.ttfbMs) > 600).length
		const mixedContent = pages.filter((p) => p.mixedContent).length
		const hstsMissing = pages.filter((p) => p.hstsMissing === true || (p.hasHsts === false && String(p.url || '').startsWith('https://'))).length
		const cspMissing = pages.filter((p) => p.hasCsp === false).length
		const sslInvalid = pages.filter((p) => p.sslValid === false).length
		const orphans = pages.filter((p) => num(p.inlinks) === 0 && num(p.crawlDepth) > 0).length
		const broken = pages.filter((p) => num(p.brokenInlinks) > 0 || num(p.brokenInternalLinks) > 0).length
		const redirectChains = pages.filter((p) => num(p.redirectChainLength) > 2).length

		const errors = status.client + status.server + sslInvalid + duplicates
		const warnings = notIndexable + canonicalMismatch + thin + lcpFail + inpFail + clsFail + hstsMissing + redirectChains
		const notices = missingAlt + missingMeta + cspMissing + missingH1 + schemaErr
		const errorsPrev = prev.filter((p) => num(p.statusCode) >= 400).length
		const warningsPrev = prev.filter((p) => p.indexable === false || num(p.lcpMs) > 2500).length

		const issues = {
			errors, warnings, notices, errorsPrev, warningsPrev,
			errors4xx: status.client,
			errors5xx: status.server,
			notIndexable, canonicalMismatch, missingTitle, missingMeta, missingH1,
			thin, duplicates, missingAlt, schemaErr,
			orphans, broken, redirectChains,
		}

		// tech
		const lcpVals = pages.map((p) => num(p.lcp || (num(p.lcpMs) / 1000))).filter((v) => v > 0)
		const inpVals = pages.map((p) => num(p.inp || p.fidMs)).filter((v) => v > 0)
		const clsVals = pages.map((p) => num(p.cls)).filter((v) => v >= 0)
		const ttfbVals = pages.map((p) => num(p.ttfbMs)).filter((v) => v > 0)
		const cwvGood = pages.filter((p) => {
			const lcp = num(p.lcp || (num(p.lcpMs) / 1000))
			const cls = num(p.cls)
			const inp = num(p.inp || p.fidMs)
			return lcp > 0 && lcp <= 2.5 && cls <= 0.1 && (inp === 0 || inp <= 200)
		}).length
		const tech = {
			cwvPass: safePct(cwvGood, html),
			cwvPassPrev: safePct(prev.filter((p) => num(p.lcp) > 0 && num(p.lcp) <= 2.5).length, prev.length),
			indexable: safePct(pages.filter((p) => p.indexable !== false).length, html),
			indexablePrev: safePct(prev.filter((p) => p.indexable !== false).length, prev.length),
			httpsCoverage: safePct(pages.filter((p) => String(p.url || '').startsWith('https://')).length, total),
			noindex: notIndexable,
			redirectChains,
			mixedContent,
			hstsMissing,
			cspMissing,
			sslInvalid,
			lcpP50: percentile(lcpVals, 50),
			lcpP90: percentile(lcpVals, 90),
			inpP50: percentile(inpVals, 50),
			inpP90: percentile(inpVals, 90),
			clsP50: percentile(clsVals, 50),
			clsP90: percentile(clsVals, 90),
			ttfbP50: percentile(ttfbVals, 50),
			ttfbP90: percentile(ttfbVals, 90),
			renderStatic: pages.filter((p) => p.renderMode === 'static' || p.jsRenderDep === false).length,
			renderSsr: pages.filter((p) => p.renderMode === 'ssr').length,
			renderCsr: pages.filter((p) => p.renderMode === 'csr' || p.jsRenderDep === true).length,
			http2: pages.filter((p) => Number(p.httpVersion) === 2 || p.httpVersion === '2').length,
			http3: pages.filter((p) => p.httpVersion === '3' || Number(p.httpVersion) === 3).length,
			http11: pages.filter((p) => p.httpVersion === '1.1' || p.httpVersion === 1.1).length,
			mobile: safePct(pages.filter((p) => p.hasViewportMeta && p.viewportWidth !== false).length, html),
		}

		const perf = { lcpFail, inpFail, clsFail, ttfbFail }

		// search
		const clicksTotal = pages.reduce((a, p) => a + num(p.gscClicks), 0)
		const imprTotal = pages.reduce((a, p) => a + num(p.gscImpressions), 0)
		const rankBuckets = {
			top3: pages.filter((p) => num(p.gscPosition) > 0 && num(p.gscPosition) <= 3).length,
			top10: pages.filter((p) => num(p.gscPosition) > 3 && num(p.gscPosition) <= 10).length,
			striking: pages.filter((p) => num(p.gscPosition) > 10 && num(p.gscPosition) <= 20).length,
			tail: pages.filter((p) => num(p.gscPosition) > 20 && num(p.gscPosition) <= 50).length,
			deep: pages.filter((p) => num(p.gscPosition) > 50).length,
		}
		const search = {
			clicksTotal,
			imprTotal,
			clicksPrev: prev.reduce((a, p) => a + num(p.gscClicks), 0),
			imprPrev: prev.reduce((a, p) => a + num(p.gscImpressions), 0),
			ctr: imprTotal ? clicksTotal / imprTotal : 0,
			avgPosition: (() => {
				const rated = pages.filter((p) => num(p.gscImpressions) > 0)
				return rated.length ? rated.reduce((a, p) => a + num(p.gscPosition), 0) / rated.length : 0
			})(),
			avgPositionPrev: (() => {
				const rated = prev.filter((p) => num(p.gscImpressions) > 0)
				return rated.length ? rated.reduce((a, p) => a + num(p.gscPosition), 0) / rated.length : 0
			})(),
			losing: pages.filter((p) => num(p.gscClicksDelta) < 0).length,
			winning: pages.filter((p) => num(p.gscClicksDelta) > 0).length,
			winners: [...pages].filter((p) => num(p.gscClicksDelta) > 0).sort((a, b) => num(b.gscClicksDelta) - num(a.gscClicksDelta)),
			losers: [...pages].filter((p) => num(p.gscClicksDelta) < 0).sort((a, b) => num(a.gscClicksDelta) - num(b.gscClicksDelta)),
			lost: pages.filter((p) => p.gscDropped === true || (num(p.gscPositionPrev) > 0 && num(p.gscPosition) === 0)).length,
			topQueries: (() => {
				const all = pages.flatMap((p) => Array.isArray(p.gscTopQueries) ? p.gscTopQueries : [])
				return [...all].sort((a, b) => num(b.clicks) - num(a.clicks)).slice(0, 12)
			})(),
			brandClicks: pages.filter((p) => p.gscIsBrand === true).reduce((a, p) => a + num(p.gscClicks), 0),
			nonBrandClicks: pages.filter((p) => p.gscIsBrand !== true).reduce((a, p) => a + num(p.gscClicks), 0),
			mobileClicks: pages.reduce((a, p) => a + num(p.gscClicksMobile), 0),
			desktopClicks: pages.reduce((a, p) => a + num(p.gscClicksDesktop), 0),
			tabletClicks: pages.reduce((a, p) => a + num(p.gscClicksTablet), 0),
			clicksSeries: last<number>(crawler.searchClicksSeries, 12, 0),
			rankBuckets,
			countryMix: (() => {
				const m = new Map<string, number>()
				for (const p of pages) for (const c of (p.gscCountries || [])) m.set(c.country, (m.get(c.country) || 0) + num(c.clicks))
				return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, value]) => ({ id, value }))
			})(),
		}

		// traffic
		const sessionsTotal = pages.reduce((a, p) => a + num(p.sessions || p.ga4Sessions), 0)
		const conversionsTotal = pages.reduce((a, p) => a + num(p.ga4Conversions || p.conversions), 0)
		const revenueTotal = pages.reduce((a, p) => a + num(p.ga4Revenue), 0)
		const traffic = {
			sessions: sessionsTotal,
			sessionsPrev: prev.reduce((a, p) => a + num(p.sessions || p.ga4Sessions), 0),
			sessionsSeries: last<number>(crawler.sessionsSeries, 30, 0),
			users: pages.reduce((a, p) => a + num(p.users || p.ga4Users), 0),
			bounceRate: (() => {
				const rated = pages.filter((p) => num(p.bounceRate) > 0)
				return rated.length ? rated.reduce((a, p) => a + num(p.bounceRate), 0) / rated.length : 0
			})(),
			bounceRatePrev: 0,
			engagementTime: (() => {
				const rated = pages.filter((p) => num(p.engagementTime) > 0)
				return rated.length ? rated.reduce((a, p) => a + num(p.engagementTime), 0) / rated.length : 0
			})(),
			conversions: conversionsTotal,
			revenue: revenueTotal,
			organic: pages.reduce((a, p) => a + num(p.sessionsOrganic), 0),
			direct: pages.reduce((a, p) => a + num(p.sessionsDirect), 0),
			referral: pages.reduce((a, p) => a + num(p.sessionsReferral), 0),
			social: pages.reduce((a, p) => a + num(p.sessionsSocial), 0),
			paid: pages.reduce((a, p) => a + num(p.sessionsPaid), 0),
			email: pages.reduce((a, p) => a + num(p.sessionsEmail), 0),
			mobile: pages.reduce((a, p) => a + num(p.sessionsMobile), 0),
			desktop: pages.reduce((a, p) => a + num(p.sessionsDesktop), 0),
			tablet: pages.reduce((a, p) => a + num(p.sessionsTablet), 0),
			sourceMix: Array.isArray(crawler.sourceMix) ? crawler.sourceMix : [],
			heatmap: crawler.trafficHeatmap || {},
			topByCountry: (() => {
				const m = new Map<string, number>()
				for (const p of pages) for (const c of (p.ga4Countries || [])) m.set(c.country, (m.get(c.country) || 0) + num(c.sessions))
				return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, value]) => ({ id, value }))
			})(),
		}

		// content
		const content = {
			thinPages: thin,
			duplicates,
			nearDupes: pages.filter((p) => num(p.semanticSimilarityScore) > 0.85).length,
			cannibal: pages.filter((p) => p.isCannibalized).length,
			decaying: pages.filter((p) => p.contentDecay).length,
			schemaErrors: schemaErr,
			schemaWarnings: pages.filter((p) => num(p.schemaWarnings) > 0).length,
			missingAlt,
			avgWords: pages.length ? Math.round(pages.reduce((a, p) => a + num(p.wordCount), 0) / pages.length) : 0,
			avgReadability: pages.length ? Math.round(pages.reduce((a, p) => a + num(p.readability || p.fleschScore), 0) / pages.length) : 0,
			langs: (() => {
				const m = new Map<string, number>()
				for (const p of pages) m.set(String(p.language || 'unknown'), (m.get(p.language) || 0) + 1)
				return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, value]) => ({ id, value }))
			})(),
		}

		// links
		const totalInlinks = pages.reduce((a, p) => a + num(p.inlinks), 0)
		const totalOutlinks = pages.reduce((a, p) => a + num(p.outlinks), 0)
		const totalExternal = pages.reduce((a, p) => a + num(p.externalOutlinks), 0)
		const links = {
			internalLinks: totalInlinks,
			outLinks: totalOutlinks,
			externalLinks: totalExternal,
			orphans,
			broken,
			refDomains: num(crawler.backlinkSummary?.refDomains),
			refDomainsPrev: num(crawler.backlinkSummary?.refDomainsPrev),
			totalBacklinks: num(crawler.backlinkSummary?.totalBacklinks),
			avgDr: num(crawler.backlinkSummary?.avgDr),
			dofollow: num(crawler.backlinkSummary?.dofollow),
			nofollow: num(crawler.backlinkSummary?.nofollow),
			ugc: num(crawler.backlinkSummary?.ugc),
			sponsored: num(crawler.backlinkSummary?.sponsored),
			new90d: num(crawler.backlinkSummary?.new90d),
			lost90d: num(crawler.backlinkSummary?.lost90d),
			toxic: num(crawler.backlinkSummary?.toxic),
			refDomainsSeries: last<number>(crawler.backlinkSummary?.refDomainsSeries, 12, 0),
			anchorMix: crawler.backlinkSummary?.anchorMix || { brand: 0, exact: 0, partial: 0, generic: 0, naked: 0, image: 0 },
			topAnchors: Array.isArray(crawler.backlinkSummary?.topAnchors) ? crawler.backlinkSummary.topAnchors : [],
			topRefDomains: Array.isArray(crawler.backlinkSummary?.topRefDomains) ? crawler.backlinkSummary.topRefDomains : [],
			hubs: [...pages].sort((a, b) => num(b.inlinks) - num(a.inlinks)).slice(0, 6),
		}

		// AI
		const ai = {
			readiness: num(crawler.aiSummary?.readiness) || 0,
			extractability: num(crawler.aiSummary?.extractability) || safePct(pages.filter((p) => p.answerBoxFit > 0.5).length, html),
			schemaCoverage: safePct(pages.filter((p) => Array.isArray(p.schemaTypes) && p.schemaTypes.length > 0).length, html),
			llmsTxt: !!crawler.aiSummary?.llmsTxt,
			llmsFullTxt: !!crawler.aiSummary?.llmsFullTxt,
			aiTxt: !!crawler.aiSummary?.aiTxt,
			bots: crawler.aiSummary?.bots || {},
			citedPages: pages.filter((p) => num(p.aiCitations) > 0).sort((a, b) => num(b.aiCitations) - num(a.aiCitations)),
			citationByEngine: crawler.aiSummary?.citationByEngine || { gpt5: 0, sonnet: 0, gemini: 0, perplexity: 0, bing: 0 },
			entities: crawler.aiSummary?.entities || { person: 0, org: 0, place: 0, product: 0 },
			entitySegments: Array.isArray(crawler.aiSummary?.entitySegments) ? crawler.aiSummary.entitySegments : [],
			missedPrompts: Array.isArray(crawler.aiSummary?.missedPrompts) ? crawler.aiSummary.missedPrompts : [],
		}

		// actions
		const actionable = pages.filter((p) => p.recommendedAction && p.recommendedAction !== 'Monitor')
		const byCategory = (() => {
			const m = new Map<string, { open: number; done: number; snoozed: number }>()
			for (const p of actionable) {
				const c = String(p.recommendedAction || 'Other')
				const cur = m.get(c) || { open: 0, done: 0, snoozed: 0 }
				const state = String(p.recommendedActionState || 'open')
				if (state === 'done') cur.done++
				else if (state === 'snoozed') cur.snoozed++
				else cur.open++
				m.set(c, cur)
			}
			return [...m.entries()].map(([id, v]) => ({ id, label: id, ...v }))
		})()
		const actions = {
			open: actionable.filter((p) => (p.recommendedActionState || 'open') === 'open').length,
			done: actionable.filter((p) => p.recommendedActionState === 'done').length,
			snoozed: actionable.filter((p) => p.recommendedActionState === 'snoozed').length,
			critical: pages.filter((p) => p.strategicPriority === 'Critical').length,
			high: pages.filter((p) => p.strategicPriority === 'High').length,
			med: pages.filter((p) => p.strategicPriority === 'Medium').length,
			low: pages.filter((p) => p.strategicPriority === 'Low').length,
			doneSeries: last<number>(crawler.actionsDoneSeries, 6, 0),
			byCategory,
			top: [...pages]
				.filter((p) => p.recommendedAction && p.recommendedAction !== 'Monitor')
				.sort((a, b) => num(b.opportunityScore) - num(a.opportunityScore))
				.slice(0, 8),
			forecast: {
				deltaScore: num(crawler.forecast?.deltaScore),
				deltaClicks: num(crawler.forecast?.deltaClicks),
				horizonDays: num(crawler.forecast?.horizonDays) || 60,
				confidence: num(crawler.forecast?.confidence) || 0.7,
			},
		}

		// opportunities
		const oppRanks = {
			striking: rankBuckets.striking,
			lowCtr: pages.filter((p) => num(p.gscPosition) > 0 && num(p.gscPosition) <= 10 && num(p.gscCtr) > 0 && num(p.gscCtr) < 0.02).length,
			quickWins: pages.filter((p) => num(p.opportunityScore) >= 70 && num(p.gscPosition) <= 20).length,
			highValueLowEng: pages.filter((p) => num(p.businessValueScore) >= 70 && num(p.engagementScore) <= 40).length,
			highValueDecay: pages.filter((p) => p.contentDecay && num(p.businessValueScore) >= 60).length,
			unlinkedAuthority: pages.filter((p) => num(p.inlinks) <= 2 && num(p.businessValueScore) >= 60).length,
		}

		// score
		const score = (() => {
			if (!total) return 0
			const a = tech.indexable * 0.25
			const b = tech.cwvPass * 0.25
			const c = safePct(total - errors - warnings, total) * 0.30
			const d = safePct(html - thin - duplicates, html) * 0.20
			return Math.max(0, Math.min(100, Math.round(a + b + c + d)))
		})()
		const scorePrev = num(crawler.compareSession?.score) || score

		// history
		const history = {
			runs: crawlHistory.length,
			lastRunRel: crawlHistory[0]?.relTime || '—',
			success: crawlHistory.filter((h) => h.outcome === 'success').length,
			partial: crawlHistory.filter((h) => h.outcome === 'partial').length,
			failed: crawlHistory.filter((h) => h.outcome === 'failed').length,
			scoreSeries: last<number>(crawlHistory.map((h) => num(h.score)).reverse(), 12, score),
			score30dAvg: (() => {
				const recent = crawlHistory.slice(0, 30).map((h) => num(h.score))
				return recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : score
			})(),
			totalPrev: prev.length,
			total30dAvg: crawlHistory.slice(0, 30).reduce((a, h) => a + num(h.pages), 0) / Math.max(1, Math.min(30, crawlHistory.length)),
			errors30dAvg: crawlHistory.slice(0, 30).reduce((a, h) => a + num(h.errors), 0) / Math.max(1, Math.min(30, crawlHistory.length)),
			recent: crawlHistory.slice(0, 8).map((h: any) => ({
				id: h.id, relTime: h.relTime || '—', score: num(h.score), label: h.label || 'Crawl', pages: num(h.pages), errors: num(h.errors), outcome: h.outcome || 'success',
			})),
		}

		// benchmark defaults
		const bench = {
			ctr: 0.034,
			refDomains: 500,
			cwvPass: 75,
		}

		// worst pages by quality score
		const worstPages = [...pages]
			.filter((p) => num(p.contentQualityScore || p.qualityScore) > 0)
			.sort((a, b) => num(a.contentQualityScore || a.qualityScore) - num(b.contentQualityScore || b.qualityScore))

		return {
			total, html, score, scorePrev,
			status, issues, tech, perf, search, traffic, content, links, ai, actions,
			history, bench, worstPages, oppRanks,
			rankBuckets,
		}
	}, [pages, prev, crawlHistory, crawler])
}
