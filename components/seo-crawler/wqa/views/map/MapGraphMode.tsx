import React, { useEffect, useRef } from 'react';
import { useGraphDataWorker } from '../../../../../hooks/useGraphDataWorker';
import { useSeoCrawler } from '../../../../../contexts/SeoCrawlerContext';

interface Props { pages: any[] }

export default function MapGraphMode({ pages }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const fgRef = useRef<any>(null);
    const graph = useGraphDataWorker(pages);
    const { setSelectedPage } = useSeoCrawler() as any;

    const [ForceGraph, setForceGraph] = React.useState<any>(null);
    const [size, setSize]             = React.useState<{ w: number; h: number }>({ w: 800, h: 600 });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!ref.current) return;
            // Use react-force-graph-2d
            const { default: ForceGraph2D } = await import('react-force-graph-2d').catch(() => ({ default: null as any }));
            if (cancelled || !ref.current) return;
            if (!ForceGraph2D) {
                ref.current.innerHTML = `<div class="text-[12px] text-[#666] p-6">Link graph unavailable in this build.</div>`;
                return;
            }
            setForceGraph(() => ForceGraph2D);
            setSize({ w: ref.current.clientWidth, h: ref.current.clientHeight });
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (ref.current) setSize({ w: ref.current.clientWidth, h: ref.current.clientHeight });
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div ref={ref} className="absolute inset-0 bg-[#070707]">
            {ForceGraph && graph.nodes.length > 0 && (
                <ForceGraph
                    ref={fgRef}
                    width={size.w}
                    height={size.h}
                    graphData={graph}
                    backgroundColor="#070707"
                    nodeRelSize={4}
                    nodeColor={(n: any) => n.status >= 400 ? '#ef4444' : n.issueCount > 2 ? '#f59e0b' : '#F5364E'}
                    linkColor={(l: any) => l.isStructural ? 'rgba(245,54,78,0.35)' : 'rgba(255,255,255,0.08)'}
                    linkWidth={(l: any) => l.isStructural ? 0.8 : 0.3}
                    nodeLabel={(n: any) => `${n.title || n.name} — depth ${n.crawlDepth}, in ${n.inlinks}`}
                    onNodeClick={(n: any) => {
                        const page = pages.find(p => p.url === n.id);
                        if (page) setSelectedPage?.(page);
                    }}
                    cooldownTicks={80}
                />
            )}
        </div>
    );
}
