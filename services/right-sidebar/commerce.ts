// services/right-sidebar/commerce.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN } from './_helpers'
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
}

const isPdp  = (p: { url?: string }) => /\/(product|item|p)\//i.test(p.url || '')
const isPlp  = (p: { url?: string }) => /\/(category|collection|shop|c)\//i.test(p.url || '')
const isCart = (p: { url?: string }) => /\/cart/i.test(p.url || '')
const isCkt  = (p: { url?: string }) => /\/checkout|\/order/i.test(p.url || '')

export function computeCommerceStats(deps: RsDataDeps): CommerceStats {
  const pages = deps.pages
  const conn = deps.integrationConnections

  const products  = pages.filter(isPdp)
  const productN  = products.length
  const oos       = countWhere(products, p => p.productAvailability === 'out_of_stock')
  const priced    = countWhere(products, p => (p.productPrice ?? 0) > 0)
  const brokenImg = products.reduce((s, p) => s + (p.brokenImageCount ?? 0), 0)
  const imgSum    = products.reduce((s, p) => s + (p.imageCount ?? 0), 0)

  const withPrice    = countWhere(products, p => (p.schemaTypes?.includes('Product') || p.schemaTypes?.includes('Offer')) && (p.productPrice ?? 0) > 0)
  const withAvail    = countWhere(products, p => (p.schemaTypes?.includes('Product') || p.schemaTypes?.includes('Offer')) && !!p.productAvailability)
  const withBrand    = countWhere(products, p => p.schemaTypes?.includes('Product') && !!p.productBrand)
  const withGtin     = countWhere(products, p => p.schemaTypes?.includes('Product') && !!p.productGtin)
  const withRatings  = countWhere(products, p => (p.schemaTypes?.includes('Product') || p.schemaTypes?.includes('AggregateRating')) && (p.productRatingCount ?? 0) > 0)

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
