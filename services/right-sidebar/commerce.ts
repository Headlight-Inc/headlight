import type { CrawledPage } from '@/services/CrawlDatabase'
import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/commerce/OverviewTab'
import { InventoryTab } from '../../components/seo-crawler/right-sidebar/modes/commerce/InventoryTab'
import { SchemaTab } from '../../components/seo-crawler/right-sidebar/modes/commerce/SchemaTab'
import { FeedTab } from '../../components/seo-crawler/right-sidebar/modes/commerce/FeedTab'
import { FunnelTab } from '../../components/seo-crawler/right-sidebar/modes/commerce/FunnelTab'

export interface CommerceStats {
	productPages: number
	categoryPages: number
	oosCount: number
	oosRate: number
	discontinuedCount: number
	avgPrice: number
	currency: string
	productSchemaCoverage: number
	offersSchemaCoverage: number
	reviewSchemaCoverage: number
	breadcrumbCoverage: number
	feedItems: number
	feedErrors: number
	feedWarnings: number
	addToCartRate: number
	checkoutStartRate: number
	purchaseRate: number
	cartAbandonment: number
	revenue30d: number
	orders30d: number
	aovAvg: number
}

export function computeCommerceStats({ pages }: RsDataDeps): CommerceStats {
	const total = pages.length || 1
	const sum = (pred: (p: CrawledPage) => boolean) => pages.filter(pred as any).length
	const sumOf = (sel: (p: CrawledPage) => number | undefined) =>
		pages.reduce((s, p) => s + (sel(p as any) ?? 0), 0)
	const avg = (sel: (p: CrawledPage) => number | undefined) => {
		const v = pages.map(sel as any).filter((x): x is number => typeof x === 'number')
		return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
	}

	const products = sum(p => (p as any).pageType === 'product')
	const hasSchema = (kind: string) => sum(p => ((p as any).schemaTypes ?? []).includes(kind))

	return {
		productPages: products,
		categoryPages: sum(p => (p as any).pageType === 'category' || (p as any).pageType === 'collection'),
		oosCount: sum(p => (p as any).productInStock === false),
		oosRate: products ? sum(p => (p as any).productInStock === false) / products : 0,
		discontinuedCount: sum(p => (p as any).productDiscontinued === true),
		avgPrice: avg(p => (p as any).productPrice),
		currency: (pages.find(p => (p as any).productCurrency) as any)?.productCurrency ?? 'USD',
		productSchemaCoverage: products ? hasSchema('Product') / products : 0,
		offersSchemaCoverage: products ? hasSchema('Offer') / products : 0,
		reviewSchemaCoverage: products ? hasSchema('AggregateRating') / products : 0,
		breadcrumbCoverage: total ? hasSchema('BreadcrumbList') / total : 0,
		feedItems: (pages[0] as any)?.feedItemCount ?? 0,
		feedErrors: (pages[0] as any)?.feedErrors ?? 0,
		feedWarnings: (pages[0] as any)?.feedWarnings ?? 0,
		addToCartRate: avg(p => (p as any).addToCartRate),
		checkoutStartRate: avg(p => (p as any).checkoutStartRate),
		purchaseRate: avg(p => (p as any).purchaseRate),
		cartAbandonment: avg(p => (p as any).cartAbandonmentRate),
		revenue30d: sumOf(p => (p as any).revenue30d),
		orders30d: sumOf(p => (p as any).orders30d),
		aovAvg: avg(p => (p as any).aov),
	}
}

export const commerceBundle: RsModeBundle<CommerceStats> = {
	modeId: 'commerce',
	computeStats: computeCommerceStats,
	tabs: {
		commerce_overview: OverviewTab,
		commerce_inventory: InventoryTab,
		commerce_schema: SchemaTab,
		commerce_feed: FeedTab,
		commerce_funnel: FunnelTab,
	},
}
