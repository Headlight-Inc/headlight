import React from 'react'

export function RsEmpty({ 
  title, 
  hint, 
  mode 
}: { 
  title?: string; 
  hint?: string;
  mode?: string;
}) {
  const displayTitle = title ?? (mode ? `No ${mode} data available` : 'No data available')
  const displayHint = hint ?? (mode ? 'Run a crawl or connect an integration to populate this view.' : '')

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10 gap-2">
      <div className="text-[12px] text-[#bbb] font-medium">{displayTitle}</div>
      {displayHint && <div className="text-[11px] text-[#666]">{displayHint}</div>}
    </div>
  )
}
