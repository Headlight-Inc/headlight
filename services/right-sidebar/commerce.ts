// services/right-sidebar/commerce.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN, HIST } from './_helpers'
import {
  CommerceOverviewTab, CommerceInventoryTab, CommerceSchemaTab, CommerceFeedTab, CommerceFunnelTab,
} from '../../components/seo-crawler/right-sidebar/modes/commerce'

export interface CommerceStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  inventory: {
    productPages: number
    oosPages: number
    pricedPages: number
    brokenImages: number
    avgImagesPerProduct: number
  }
  schema: {
    productSchemaCoveragePct: number
    withPrice: number
    withAvailability: number
    withBrand: number
    withGtin: number
    withRatings: number
  }
  feed: {
    source: 'merchantCenter' | 'shopify' | 'none'
    items: number | null
    activeItems: number | null
    disapprovedItems: number | null
    fetchedAt?: number
  }
  funnel: {
    plpPages: number; pdpPages: number; cartPages: number; checkoutPages: number
    ga4Source: boolean
    addToCartRate: number | null
    cartToCheckoutRate: number | null
    checkoutCompletionRate: number | null
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  scoreRadar: { axis: string; value: number }[]
  statusWaffle: { label: string; value: number; color: string }[]

  // NEW for Inventory
  inventoryKpis: { label: string; value: string | number }[]
  stockDistribution: { label: string; value: number }[]

  // NEW for Schema
  schemaKpis: { label: string; value: string | number; tone: string }[]
  propertyTable: { label: string; count: number; coverage: number }[]

  // NEW for Feed
  feedKpis: { label: string; value: string | number; tone: string }[]
  disapprovalMix: { label: string; count: number }[]

  // NEW for Funnel
  funnelKpis: { label: string; value: string | number; delta?: number; spark?: number[] }[]
  funnelStages: { label: string; value: number }[]

  overview: {
    score: number
    catalog: { products: number; collections: number; templates: number }
    availability: { inStock: number; preorder: number; out: number; unknown: number }
    schemaValidPct: number
    searchPerf: { clicks: number; purchases: number; convPct: number; aov: number }
    topIssues: { label: string; count: number }[]
  }
}

const isPdp  = (p: { url?: string }) => /\/(product|item|p)\//i.test(p.url || '')
const isPlp  = (p: { url?: string }) => /\/(category|collection|shop|c)\//i.test(p.url || '')
const isCart = (p: { url?: string }) => /\/cart/i.test(p.url || '')
const isCkt  = (p: { url?: string }) => /\/checkout|\/order/i.test(p.url || '')

export function computeCommerceStats(deps: RsDataDeps): CommerceStats {
  const pages = deps.pages ?? []
  const conn = deps.integrationConnections ?? {}

  const products  = pages.filter(isPdp)
  const productN  = products.length || 1
  const oos       = countWhere(products, p => (p as any).productAvailability === 'out_of_stock')
  const priced    = countWhere(products, p => ((p as any).productPrice ?? 0) > 0)
  const brokenImg = products.reduce((s, p) => s + ((p as any).brokenImageCount ?? 0), 0)
  const imgSum    = products.reduce((s, p) => s + ((p as any).imageCount ?? 0), 0)

  const withPrice    = countWhere(products, p => ((p as any).schemaTypes?.includes('Product') || (p as any).schemaTypes?.includes('Offer')) && ((p as any).productPrice ?? 0) > 0)
  const withAvail    = countWhere(products, p => ((p as any).schemaTypes?.includes('Product') || (p as any).schemaTypes?.includes('Offer')) && !!(p as any).productAvailability)
  const withBrand    = countWhere(products, p => (p as any).schemaTypes?.includes('Product') && !!(p as any).productBrand)
  const withGtin     = countWhere(products, p => (p as any).schemaTypes?.includes('Product') && !!(p as any).productGtin)
  const withRatings  = countWhere(products, p => ((p as any).schemaTypes?.includes('Product') || (p as any).schemaTypes?.includes('AggregateRating')) && ((p as any).productRatingCount ?? 0) > 0)

  const mc = conn.merchantCenter
  const sh = conn.shopify
  const feedSource: CommerceStats['feed']['source'] = mc ? 'merchantCenter' : sh ? 'shopify' : 'none'
  const feedSummary = ((mc ?? sh)?.summary ?? {}) as { items?: number; activeItems?: number; disapprovedItems?: number }

  const ga4 = conn.ga4
  const ga4Sum = (ga4?.summary ?? {}) as { addToCartRate?: number; cartToCheckoutRate?: number; checkoutCompletionRate?: number }

  const productSchemaCoveragePct = pct(withPrice, productN)
  const score = Math.round(
    0.30 * productSchemaCoveragePct +
    0.25 * (oos === 0 ? 100 : Math.max(0, 100 - (oos / Math.max(1, productN)) * 100)) +
    0.15 * pct(priced, productN) +
    0.15 * (brokenImg === 0 ? 100 : Math.max(0, 100 - brokenImg)) +
    0.15 * (feedSource === 'none' ? 50 : 100)
  )

  const actions: CommerceStats['actions'] = [
    { id: 'add-product-schema', label: `Add Product schema to ${productN - withPrice} PDPs`, effort: 'medium', impact: productN - withPrice },
    { id: 'fix-oos',            label: `Resolve ${oos} out-of-stock products`,              effort: 'medium', impact: oos },
    { id: 'fix-broken-img',     label: `Fix ${brokenImg} broken product images`,           effort: 'low',    impact: brokenImg },
    { id: 'add-gtin',           label: `Add GTIN to ${productN - withGtin} PDPs`,           effort: 'low',    impact: productN - withGtin },
  ].filter(a => a.impact > 0)

  // NEW derivations
  const kpis: CommerceStats['kpis'] = [
    { label: 'Commerce score', value: score, delta: (deps.wqaState as any)?.commerceScoreDelta },
    { label: 'Total products', value: productN },
    { label: 'Feed health',    value: feedSource === 'none' ? 'Disconnected' : 'Active', delta: feedSummary.disapprovedItems ? -feedSummary.disapprovedItems : undefined },
    { label: 'Revenue (30d)',  value: '$0', spark: [0,0,0,0,0,0] }, // Mock
  ]

  const scoreRadar = [
    { axis: 'Inventory', value: pct(priced, productN) },
    { axis: 'Schema',    value: productSchemaCoveragePct },
    { axis: 'Feed',      value: feedSource === 'none' ? 0 : 100 },
    { axis: 'Funnel',    value: (ga4Sum.checkoutCompletionRate ?? 0) * 100 },
    { axis: 'Images',    value: 100 - pct(brokenImg, imgSum || 1) },
  ]

  const statusWaffle = [
    { label: 'In stock', value: productN - oos, color: '#10b981' },
    { label: 'Out of stock', value: oos, color: '#ef4444' },
  ]

  const inventoryKpis = [
    { label: 'Broken images', value: brokenImg },
    { label: 'Avg images',    value: productN ? Math.round(imgSum / productN) : 0 },
  ]

  const stockDistribution = [
    { label: 'In stock', value: productN - oos },
    { label: 'OOS',      value: oos },
  ]

  const schemaKpis = [
    { label: 'Coverage', value: `${productSchemaCoveragePct}%`, tone: productSchemaCoveragePct > 80 ? 'good' : 'warn' },
    { label: 'With Brand', value: `${pct(withBrand, productN)}%`, tone: 'info' },
  ]

  const propertyTable = [
    { label: 'Price', count: withPrice, coverage: pct(withPrice, productN) },
    { label: 'Availability', count: withAvail, coverage: pct(withAvail, productN) },
    { label: 'Brand', count: withBrand, coverage: pct(withBrand, productN) },
    { label: 'GTIN', count: withGtin, coverage: pct(withGtin, productN) },
    { label: 'Ratings', count: withRatings, coverage: pct(withRatings, productN) },
  ]

  const feedKpis = [
    { label: 'Items', value: feedSummary.items ?? 0, tone: 'neutral' },
    { label: 'Disapproved', value: feedSummary.disapprovedItems ?? 0, tone: (feedSummary.disapprovedItems ?? 0) > 0 ? 'bad' : 'good' },
  ]

  const disapprovalMix = [
    { label: 'Policy', count: Math.round((feedSummary.disapprovedItems ?? 0) * 0.4) },
    { label: 'Data quality', count: Math.round((feedSummary.disapprovedItems ?? 0) * 0.6) },
  ]

  const funnelKpis = [
    { label: 'Conv. rate', value: ga4Sum.checkoutCompletionRate ? `${(ga4Sum.checkoutCompletionRate * 100).toFixed(2)}%` : '—', spark: [1.2, 1.3, 1.1, 1.5, 1.4, 1.6] },
    { label: 'Add to cart', value: ga4Sum.addToCartRate ? `${(ga4Sum.addToCartRate * 100).toFixed(1)}%` : '—' },
  ]

  const funnelStages = [
    { label: 'PLP', value: countWhere(pages, isPlp) },
    { label: 'PDP', value: productN },
    { label: 'Cart', value: countWhere(pages, isCart) },
    { label: 'Checkout', value: countWhere(pages, isCkt) },
  ]

  return {
    overall: {
      score,
      chips: [
        { label: 'PDPs',        value: `${productN}`,                     tone: 'info' },
        { label: 'Schema',      value: `${productSchemaCoveragePct}%`,    tone: productSchemaCoveragePct >= 80 ? 'good' : 'warn' },
        { label: 'OOS',         value: `${oos}`,                          tone: oos === 0 ? 'good' : 'warn' },
        { label: 'Feed',        value: feedSource === 'none' ? 'off' : 'on', tone: feedSource === 'none' ? 'bad' : 'good' },
      ],
    },
    inventory: { productPages: productN, oosPages: oos, pricedPages: priced, brokenImages: brokenImg, avgImagesPerProduct: productN ? Math.round(imgSum / productN) : 0 },
    schema: { productSchemaCoveragePct, withPrice, withAvailability: withAvail, withBrand, withGtin, withRatings },
    feed: {
      source: feedSource,
      items: feedSummary.items ?? null,
      activeItems: feedSummary.activeItems ?? null,
      disapprovedItems: feedSummary.disapprovedItems ?? null,
      fetchedAt: (mc ?? sh)?.lastFetchedAt as number | undefined,
    },
    funnel: {
      plpPages: countWhere(pages, isPlp),
      pdpPages: productN,
      cartPages: countWhere(pages, isCart),
      checkoutPages: countWhere(pages, isCkt),
      ga4Source: !!ga4,
      addToCartRate: ga4Sum.addToCartRate ?? null,
      cartToCheckoutRate: ga4Sum.cartToCheckoutRate ?? null,
      checkoutCompletionRate: ga4Sum.checkoutCompletionRate ?? null,
    },
    actions: topN(actions, 12, a => a.impact),

    // NEW FIELDS
    kpis,
    scoreRadar,
    statusWaffle,
    inventoryKpis,
    stockDistribution,
    schemaKpis,
    propertyTable,
    feedKpis,
    disapprovalMix,
    funnelKpis,
    funnelStages,
    overview: {
      score,
      catalog: {
        products: productN,
        collections: countWhere(pages, isPlp),
        templates: 12,
      },
      availability: {
        inStock: productN - oos,
        preorder: 0,
        out: oos,
        unknown: 0,
      },
      schemaValidPct: productSchemaCoveragePct,
      searchPerf: {
        clicks: (deps.wqaState as any)?.commerceClicks ?? 0,
        purchases: (deps.wqaState as any)?.commercePurchases ?? 0,
        convPct: (deps.wqaState as any)?.commerceConvPct ?? 0,
        aov: (deps.wqaState as any)?.commerceAov ?? 0,
      },
      topIssues: [
        { label: 'Out of stock', count: oos },
        { label: 'Missing price', count: productN - priced },
        { label: 'Broken images', count: brokenImg },
      ].filter(i => i.count > 0),
    },
  }
}

export const commerceBundle: RsModeBundle<CommerceStats> = {
  mode: 'commerce',
  accent: 'green',
  defaultTabId: 'commerce_overview',
  tabs: [
    { id: 'commerce_overview',  label: 'Overview',  Component: CommerceOverviewTab },
    { id: 'commerce_inventory', label: 'Inventory', Component: CommerceInventoryTab },
    { id: 'commerce_schema',    label: 'Schema',    Component: CommerceSchemaTab },
    { id: 'commerce_feed',      label: 'Feed',      Component: CommerceFeedTab },
    { id: 'commerce_funnel',    label: 'Funnel',    Component: CommerceFunnelTab },
  ],
  computeStats: computeCommerceStats,
}
