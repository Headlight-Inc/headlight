import React from 'react'
import { Card } from '../Card'
import { MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../'

export default {
  title: 'RightSidebar/Shared/UIExtras',
}

export const UIExtras = () => (
  <div className="p-4 bg-black w-[320px] flex flex-col gap-6">
    <Card title="MoverList">
      <MoverList 
        winners={[
          { label: 'nike.com', delta: 120, unit: '%' },
          { label: 'adidas.com', delta: 45, unit: '%' },
        ]}
        losers={[
          { label: 'puma.com', delta: -30, unit: '%' },
          { label: 'reebok.com', delta: -12, unit: '%' },
        ]}
      />
    </Card>

    <Card title="ScoreBreakdown">
      <ScoreBreakdown parts={[
        { label: 'Performance', weight: 0.4, value: 85, reason: 'Fast LCP' },
        { label: 'Accessibility', weight: 0.3, value: 60, reason: 'Missing alt tags' },
        { label: 'SEO', weight: 0.3, value: 95 },
      ]} />
    </Card>

    <Card title="ForecastPill">
      <div className="flex flex-col gap-2">
        <ForecastPill f={{ label: 'expected traffic', deltaValue: 1200, unit: '/mo', confidencePct: 85, positiveIsGood: true }} />
        <ForecastPill f={{ label: 'bounce reduction', deltaValue: -5, unit: '%', confidencePct: 60, positiveIsGood: true }} />
      </div>
    </Card>

    <Card title="AuctionMatrix">
      <AuctionMatrix rows={[
        { domain: 'competitor1.com', overlapPct: 85, abvPosPct: 40, topOfPagePct: 60, outranking: 12 },
        { domain: 'competitor2.com', overlapPct: 30, abvPosPct: 10, topOfPagePct: 15, outranking: 2 },
      ]} />
    </Card>

    <Card title="BotMatrix">
      <BotMatrix rows={[
        { bot: 'Googlebot', robotsAllowed: true, metaAllowed: true },
        { bot: 'Bingbot', robotsAllowed: true, metaAllowed: false },
        { bot: 'AhrefsBot', robotsAllowed: false, metaAllowed: false },
      ]} />
    </Card>

    <Card title="NapGrid">
      <NapGrid rows={[
        { source: 'Google Business', name: 'ok', address: 'ok', phone: 'ok' },
        { source: 'Yelp', name: 'ok', address: 'warn', phone: 'fail' },
      ]} />
    </Card>

    <Card title="OgPreviewCard">
      <OgPreviewCard og={{
        url: 'https://headlight.inc',
        title: 'Headlight SEO | Premium Search Intelligence',
        description: 'The most powerful SEO crawler and analyzer for modern web teams.',
        image: 'https://placehold.co/1200x630/1a1a1a/white?text=Headlight+SEO',
        warnings: ['og:image:width missing', 'og:image:height missing']
      }} />
    </Card>
  </div>
)
