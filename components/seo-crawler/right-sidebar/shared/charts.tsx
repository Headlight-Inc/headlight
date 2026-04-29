import * as React from 'react'
import {
	Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
	Bar as ReBar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
	Line, LineChart, Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis,
	CartesianGrid
} from 'recharts'

export function MiniRadar({
	data,
}: { data: ReadonlyArray<{ axis: string; value: number }> }) {
	return (
		<div className="h-44">
			<ResponsiveContainer>
				<RadarChart data={data as any} outerRadius="75%">
					<PolarGrid stroke="#222" />
					<PolarAngleAxis dataKey="axis" tick={{ fill: '#a3a3a3', fontSize: 10 }}  />
					<PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
					<Radar dataKey="value" stroke="#F5364E" fill="#F5364E" fillOpacity={0.25} />
				</RadarChart>
			</ResponsiveContainer>
		</div>
	)
}

export function MiniBar({
	data, height = 120,
}: {
	data: ReadonlyArray<{ name: string; value: number; tone?: string }>
	height?: number
}) {
	return (
		<div style={{ height }}>
			<ResponsiveContainer>
				<BarChart data={data as any} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
					<XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 10 }}  axisLine={false} tickLine={false} />
					<YAxis tick={{ fill: '#a3a3a3', fontSize: 10 }}  axisLine={false} tickLine={false} width={28} />
					<Tooltip
						cursor={{ fill: '#1a1a1a55' }} 
						contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: 11 }}
					/>
					<ReBar dataKey="value">
						{data.map((d, i) => <Cell key={i} fill={d.tone ?? '#F5364E'} />)}
					</ReBar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

export function MiniDonut({
	data,
}: { data: ReadonlyArray<{ name: string; value: number; color: string }> }) {
	return (
		<div className="h-32">
			<ResponsiveContainer>
				<PieChart>
					<Pie data={data as any} dataKey="value" innerRadius={32} outerRadius={50} stroke="#0a0a0a">
						{data.map((d, i) => <Cell key={i} fill={d.color} />)}
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		</div>
	)
}

export function Sparkline({ data }: { data: ReadonlyArray<number> }) {
	const points = data.map((v, i) => ({ i, v }))
	return (
		<div className="h-10">
			<ResponsiveContainer>
				<LineChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
					<Line type="monotone" dataKey="v" stroke="#F5364E" strokeWidth={1.5} dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}

export function StackedBar({
	parts,
}: { parts: ReadonlyArray<{ value: number; color: string; label: string }> }) {
	const total = parts.reduce((s, p) => s + p.value, 0) || 1
	return (
		<div>
			<div className="flex h-2 w-full overflow-hidden rounded bg-[#1a1a1a]">
				{parts.map((p, i) => (
					<div key={i} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
				))}
			</div>
			<div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-neutral-400">
				{parts.map((p, i) => (
					<span key={i} className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-sm" style={{ background: p.color }}  />
						{p.label} · {p.value}
					</span>
				))}
			</div>
		</div>
	)
}

export function ScatterPlot({
	data, xLabel, yLabel, height = 160
}: {
	data: Array<{ x: number; y: number; url?: string }>
	xLabel: string
	yLabel: string
	height?: number
}) {
	return (
		<div style={{ height }}>
			<ResponsiveContainer>
				<ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
					<XAxis
						type="number"
						dataKey="x"
						name={xLabel}
						domain={[0, 'auto']}
						tick={{ fill: '#666', fontSize: 9 }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						type="number"
						dataKey="y"
						name={yLabel}
						tick={{ fill: '#666', fontSize: 9 }}
						axisLine={false}
						tickLine={false}
						width={30}
					/>
					<ZAxis type="number" range={[40, 40]} />
					<Tooltip
						cursor={{ strokeDasharray: '3 3' }}
						contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: 10 }}
					/>
					<Scatter name="Pages" data={data} fill="#F5364E" fillOpacity={0.6}>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.x <= 10 ? '#22c55e' : entry.x <= 20 ? '#F5364E' : '#444'} />
						))}
					</Scatter>
				</ScatterChart>
			</ResponsiveContainer>
		</div>
	)
}

export function Histogram({
  data, height = 110,
}: {
  data: ReadonlyArray<{ name: string; value: number; tone?: string }>
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data as any} margin={{ top: 6, right: 6, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="#1a1a1a" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: 11 }} />
        <ReBar dataKey="value" radius={[2, 2, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.tone || '#3b82f6'} />)}
        </ReBar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function KpiStrip({
  items,
}: {
  items: ReadonlyArray<{ label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: 'good' | 'warn' | 'bad' | 'neutral' }>
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-white/5 bg-[#0a0a0a] p-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">{it.label}</div>
          <div className={
            'mt-0.5 text-base font-semibold ' +
            (it.tone === 'good' ? 'text-emerald-400'
              : it.tone === 'warn' ? 'text-amber-400'
              : it.tone === 'bad' ? 'text-rose-400'
              : 'text-white')
          }>{it.value}</div>
          {it.sub && <div className="text-[10px] text-neutral-500 mt-0.5">{it.sub}</div>}
        </div>
      ))}
    </div>
  )
}
