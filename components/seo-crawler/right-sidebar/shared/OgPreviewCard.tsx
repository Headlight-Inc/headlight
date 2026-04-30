// components/seo-crawler/right-sidebar/shared/OgPreviewCard.tsx
export interface OgPreview {
  url: string
  title?: string
  description?: string
  image?: string | null
  warnings?: string[]
}

export function OgPreviewCard({ og }: { og: OgPreview }) {
  return (
    <div className="rounded-md border border-[#1a1a1a] bg-[#080808] overflow-hidden">
      <div className="aspect-[1200/630] bg-[#101010] flex items-center justify-center text-[10px] text-[#555]">
        {og.image ? <img alt="" src={og.image} className="w-full h-full object-cover" /> : 'no og:image'}
      </div>
      <div className="p-2">
        <div className="truncate text-[11px] text-neutral-200">{og.title ?? '(missing og:title)'}</div>
        <div className="line-clamp-2 text-[10px] text-[#888]">{og.description ?? '(missing og:description)'}</div>
        <div className="mt-1 text-[10px] text-[#555] truncate">{og.url}</div>
        {og.warnings && og.warnings.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1">
            {og.warnings.map(w => <li key={w} className="rounded border border-amber-700/40 bg-amber-900/20 text-amber-300 px-1 py-[1px] text-[9px]">{w}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
