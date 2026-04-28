import * as React from 'react'

export function RsEmpty({ message }: { message: string }) {
	return (
		<div className="flex h-32 items-center justify-center text-[11px] text-neutral-500 italic">
			{message}
		</div>
	)
}
