import React from 'react'
export function RsError({ message }: { message: string }) {
  return (
    <div className="m-3 bg-red-900/15 border border-red-700/40 rounded p-3 text-[11px] text-red-300">
      {message}
    </div>
  )
}
