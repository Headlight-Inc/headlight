import React from 'react'
export function RsPartial({ title = 'Partial data', reason, cta }: {
  title?: string; reason?: string; cta?: { label: string; onClick: () => void }
}) {
  return (
    <div className="m-3 bg-[#0f0f0f] border border-[#222] rounded p-3 text-center">
      <div className="text-[12px] text-[#ddd] font-semibold">{title}</div>
      {reason && <div className="text-[11px] text-[#888] mt-1">{reason}</div>}
      {cta && (
        <button onClick={cta.onClick}
          className="mt-2 px-2 py-1 text-[11px] rounded bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222] text-[#ddd]">
          {cta.label}
        </button>
      )}
    </div>
  )
}
