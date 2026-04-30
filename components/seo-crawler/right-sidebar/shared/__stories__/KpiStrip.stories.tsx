import React from 'react'
import { Card } from '../Card'
import { KpiStrip, KpiTile } from '../KpiStrip'

export default {
  title: 'RightSidebar/Shared/KpiStrip',
  component: KpiStrip,
}

const mockTiles: KpiTile[] = [
  { label: 'Total Pages', value: '1,240', delta: { value: 0.05, positiveIsGood: true }, spark: [10, 12, 15, 14, 18, 20] },
  { label: 'Health Score', value: '84', delta: { value: -0.02, positiveIsGood: true }, spark: [85, 84, 86, 83, 84] },
  { label: 'Crawl Rate', value: '12/s', delta: { value: 0.15, positiveIsGood: true }, spark: [8, 10, 12, 11, 14, 12] },
  { label: 'Errors', value: '12', delta: { value: -0.5, positiveIsGood: false }, spark: [24, 20, 18, 15, 12] },
]

export const Default = () => (
  <div className="p-4 bg-black w-[320px]">
    <Card title="KPI Strip (Full)">
      <KpiStrip tiles={mockTiles} columns={2} />
    </Card>
  </div>
)

export const Empty = () => (
  <div className="p-4 bg-black w-[320px]">
    <Card title="KPI Strip (Empty)">
      <KpiStrip tiles={[]} />
    </Card>
  </div>
)
