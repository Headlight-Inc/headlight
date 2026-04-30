import React from 'react'

export function RsError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-[#3a1a1a] bg-[#1a0d0d] px-3 py-2 text-[11px] text-[#f99]">
      {message}
    </div>
  )
}
