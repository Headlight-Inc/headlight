import React from 'react'
export function RsEmpty({ title = 'Nothing to show yet', hint }: { title?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center text-[#666] py-8 px-3">
      <div className="text-[12px] text-[#aaa] font-semibold">{title}</div>
      {hint && <div className="text-[11px] text-[#666] mt-1">{hint}</div>}
    </div>
  )
}
