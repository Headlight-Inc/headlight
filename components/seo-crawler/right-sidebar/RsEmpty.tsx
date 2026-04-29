import React from 'react'

export function RsEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10 gap-2">
      <div className="text-[12px] text-[#bbb] font-medium">{title}</div>
      {hint && <div className="text-[11px] text-[#666]">{hint}</div>}
    </div>
  )
}
