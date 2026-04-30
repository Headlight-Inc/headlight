import React from 'react'
import { Card } from '../Card'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant } from '../charts'

export default {
  title: 'RightSidebar/Shared/Charts',
}

export const AllCharts = () => (
  <div className="p-4 bg-black w-[320px] flex flex-col gap-6">
    <Card title="Histogram">
      <Histogram bins={[
        { label: '0-20ms', count: 120, tone: 'good' },
        { label: '20-50ms', count: 450, tone: 'good' },
        { label: '50-100ms', count: 200, tone: 'warn' },
        { label: '>100ms', count: 45, tone: 'bad' },
      ]} />
    </Card>

    <Card title="Waffle">
      <Waffle pct={68} />
    </Card>

    <Card title="MiniTreemap">
      <MiniTreemap nodes={[
        { label: 'Organic', value: 450, tone: 'good' },
        { label: 'Direct', value: 300, tone: 'neutral' },
        { label: 'Social', value: 150, tone: 'warn' },
        { label: 'Referral', value: 100, tone: 'bad' },
      ]} />
    </Card>

    <Card title="BestTimeHeatmap">
      <BestTimeHeatmap 
        hourLabels={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']}
        buckets={[
          [1, 2, 5, 8, 3, 1, 0],
          [0, 1, 2, 4, 2, 0, 0],
          [5, 8, 12, 15, 10, 5, 2],
          [10, 15, 25, 30, 20, 12, 8],
          [8, 12, 20, 22, 18, 10, 5],
          [2, 5, 8, 10, 6, 4, 2],
        ]}
      />
    </Card>

    <Card title="FunnelBar">
      <FunnelBar steps={[
        { label: 'Sessions', users: 1200 },
        { label: 'Product View', users: 800 },
        { label: 'Add to Cart', users: 400, flag: 'warn' },
        { label: 'Checkout', users: 100, flag: 'bad' },
      ]} />
    </Card>

    <Card title="Quadrant">
      <Quadrant 
        xLabel="Friction"
        yLabel="Intent"
        midX={50}
        midY={50}
        points={[
          { x: 20, y: 80, label: 'Star', tone: 'good' },
          { x: 80, y: 20, label: 'Fix', tone: 'bad' },
          { x: 40, y: 40, label: 'Neutral', tone: 'warn' },
        ]}
      />
    </Card>
  </div>
)
