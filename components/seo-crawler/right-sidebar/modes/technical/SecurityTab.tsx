import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Security() {
  const s = useRsStats('technical')
  if (!s) return <RsEmpty mode="technical" />
  const sec = s.security
  const flag = (b: boolean) => ({ value: b ? 'on' : 'off', tone: (b ? 'good' : 'warn') as const })
  return (
    <>
      <Card>
        <SectionTitle>Headers</SectionTitle>
        <Row label="HTTPS"             {...flag(sec.https)} />
        <Row label="HSTS"              {...flag(sec.hsts)} />
        <Row label="CSP"               {...flag(sec.csp)} />
        <Row label="X-Frame-Options"   {...flag(sec.xFrame)} />
        <Row label="X-Content-Type"    {...flag(sec.xContent)} />
        <Row label="Referrer-Policy"   {...flag(sec.referrerPolicy)} />
        <Row label="Permissions-Policy"{...flag(sec.permissionsPolicy)} />
      </Card>
      {sec.tls && (
        <Card>
          <SectionTitle>TLS</SectionTitle>
          <Row label="Version" value={sec.tls.version} />
          <Row label="Days to expiry" value={sec.tls.daysToExpiry ?? '—'} tone={sec.tls.daysToExpiry != null && sec.tls.daysToExpiry < 30 ? 'warn' : undefined} />
          <Row label="Chain valid" {...flag(sec.tls.chainValid)} />
        </Card>
      )}
      <Card>
        <SectionTitle>Mixed content / cookies</SectionTitle>
        <Row label="Mixed content pages" value={sec.mixedContentPages} tone={sec.mixedContentPages ? 'bad' : undefined} />
        <Row label="Cookies 1P/3P"      value={`${sec.cookies.firstParty}/${sec.cookies.thirdParty}`} />
        <Row label="Secure flag %"      value={`${Math.round(sec.cookies.secureFlagPct)}%`} />
        <Row label="SameSite %"         value={`${Math.round(sec.cookies.sameSitePct)}%`} />
      </Card>
      <Card>
        <SectionTitle>Exposure</SectionTitle>
        <Row label=".git directory" {...flag(!sec.exposure.gitDir)} />
        <Row label=".env file"      {...flag(!sec.exposure.envFile)} />
        <Row label="Server hidden"  {...flag(sec.exposure.serverHeaderHidden)} />
      </Card>
    </>
  )
}
