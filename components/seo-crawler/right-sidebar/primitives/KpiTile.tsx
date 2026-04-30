import React from 'react'
import { DeltaPill } from './DeltaPill'

export function KpiTile({ label, value, sub, delta, deltaSuffix = '%', goodIsUp = true, accent }: {
    label: string
    value: React.ReactNode
    sub?: React.ReactNode
    delta?: number | null
    deltaSuffix?: string
    goodIsUp?: boolean
    accent?: 'good' | 'warn' | 'bad' | 'info' | null
}) {
    const tone =
        accent === 'good' ? 'text-emerald-400' :
        accent === 'warn' ? 'text-amber-400'   :
        accent === 'bad'  ? 'text-red-400'     :
        accent === 'info' ? 'text-sky-400'     : 'text-white'
    return (
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-md p-2.5">
            <div className="text-[9px] text-[#666] uppercase tracking-[0.16em] truncate">{label}</div>
            <div className="flex items-end gap-1.5 mt-0.5">
                <div className={`text-[20px] font-black tabular-nums leading-none ${tone}`}>{value}</div>
                {delta !== undefined && delta !== null && (
                    <div className="mb-0.5"><DeltaPill value={delta} suffix={deltaSuffix} goodIsUp={goodIsUp} /></div>
                )}
            </div>
            {sub && <div className="text-[10px] text-[#666] mt-1 truncate">{sub}</div>}
        </div>
    )
}
