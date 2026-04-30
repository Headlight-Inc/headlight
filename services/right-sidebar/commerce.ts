import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { countWhere, isPdp, pct } from './utils'
import { CommerceOverviewTab, CommerceInventoryTab, CommerceSchemaTab, CommerceFeedTab, CommerceFunnelTab } from '../../components/seo-crawler/right-sidebar/modes/commerce'

export interface CommerceStats {
  source: 'merchantCenter' | 'shopify' | 'crawler' | 'none'
  overview: { products: number; outOfStock: number; lowStock: number; priceErrors: number; itemsRevenue: number | null; aov: number | null }
  inventory: { totalSkus: number; outOfStock: number; lowStock: number; oversold: number; staleListings: number }
  schema: { withProductSchema: number; missingSchema: number; missingPrice: number; missingAvailability: number; missingReviews: number }
  feed: { feedItems: number; feedErrors: number; feedWarnings: number; lastSync?: string; topErrorReasons: ReadonlyArray<{ label: string; count: number }> }
  funnel: { addToCartRate: number | null; checkoutStartRate: number | null; purchaseRate: number | null; abandonedCarts: number | null }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeCommerceStats(deps: RsDataDeps): CommerceStats {
  const pages = deps.pages ?? []
  const conn = deps.integrationConnections ?? {}
  const mc = conn.merchantCenter, sh = conn.shopify
  const source: CommerceStats['source'] = mc ? 'merchantCenter' : sh ? 'shopify' : pages.some(isPdp) ? 'crawler' : 'none'
  const sum = ((mc ?? sh)?.summary ?? {}) as any

  const pdps = pages.filter(isPdp)
  const withSchema = countWhere(pdps, p => Array.isArray(p?.schemaTypes) && p.schemaTypes.some((t: string) => t === 'Product'))
  const missingPrice = countWhere(pdps, p => p?.price == null)
  const missingAvail = countWhere(pdps, p => p?.availability == null)
  const missingReviews = countWhere(pdps, p => !p?.aggregateRating)

  const oos  = sum.outOfStock ?? countWhere(pdps, p => p?.availability === 'OutOfStock')
  const low  = sum.lowStock   ?? countWhere(pdps, p => Number(p?.stockQty ?? 0) > 0 && Number(p?.stockQty) < 5)
  const priceErrors = sum.priceErrors ?? 0

  const actions: RsAction[] = []
  if (oos)              actions.push({ id: 'oos',     label: `Hide or refresh ${oos} out-of-stock PDPs`, severity: 'revenueLoss', effort: 'low', impact: 70, pagesAffected: oos })
  if (missingPrice)     actions.push({ id: 'price',   label: `Add price to ${missingPrice} PDPs`,         severity: 'highLeverage', effort: 'low', impact: 60, pagesAffected: missingPrice })
  if (missingAvail)     actions.push({ id: 'avail',   label: `Add availability to ${missingAvail} PDPs`,  severity: 'highLeverage', effort: 'low', impact: 60, pagesAffected: missingAvail })
  if (missingReviews)   actions.push({ id: 'reviews', label: `Add review schema to ${missingReviews} PDPs`, severity: 'strategic', effort: 'med', impact: 40, pagesAffected: missingReviews })
  if ((sum.feedErrors ?? 0) > 0) actions.push({ id: 'feed', label: `Fix ${sum.feedErrors} feed errors`, severity: 'revenueLoss', effort: 'med', impact: 65 })

  return {
    source,
    overview: {
      products: sum.products ?? pdps.length,
      outOfStock: oos, lowStock: low, priceErrors,
      itemsRevenue: sum.itemsRevenue ?? null,
      aov: sum.aov ?? null,
    },
    inventory: {
      totalSkus: sum.totalSkus ?? pdps.length,
      outOfStock: oos, lowStock: low,
      oversold: sum.oversold ?? 0,
      staleListings: sum.staleListings ?? 0,
    },
    schema: {
      withProductSchema: withSchema,
      missingSchema: pdps.length - withSchema,
      missingPrice, missingAvailability: missingAvail, missingReviews,
    },
    feed: {
      feedItems:    sum.feedItems    ?? 0,
      feedErrors:   sum.feedErrors   ?? 0,
      feedWarnings: sum.feedWarnings ?? 0,
      lastSync:     (mc ?? sh)?.lastFetchedAt,
      topErrorReasons: sum.topFeedErrorReasons ?? [],
    },
    funnel: {
      addToCartRate:     sum.addToCartRate     ?? null,
      checkoutStartRate: sum.checkoutStartRate ?? null,
      purchaseRate:      sum.purchaseRate      ?? null,
      abandonedCarts:    sum.abandonedCarts    ?? null,
    },
    actions,
    fetchedAt: (mc ?? sh)?.lastFetchedAt,
  }
}

export const commerceBundle: RsModeBundle<CommerceStats> = {
  mode: 'commerce', accent: 'green', defaultTabId: 'commerce_overview',
  tabs: [
    { id: 'commerce_overview',  label: 'Overview',  Component: CommerceOverviewTab },
    { id: 'commerce_inventory', label: 'Inventory', Component: CommerceInventoryTab },
    { id: 'commerce_schema',    label: 'Schema',    Component: CommerceSchemaTab },
    { id: 'commerce_feed',      label: 'Feed',      Component: CommerceFeedTab },
    { id: 'commerce_funnel',    label: 'Funnel',    Component: CommerceFunnelTab },
  ],
  computeStats: computeCommerceStats,
}
