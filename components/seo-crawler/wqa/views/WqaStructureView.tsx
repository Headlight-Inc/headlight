import React, { useMemo, useState, lazy, Suspense } from 'react';
import { ChevronDown, ChevronRight, Folder, FileText as FileIcon } from 'lucide-react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import EmptyViewState from './shared/EmptyViewState';

// ForceGraph3D is already used elsewhere in MainDataView; lazy-import to keep bundle lean.
const ForceGraph3D = lazy(() => import('react-force-graph-3d'));

type TreeNode = {
    name: string;
    path: string;
    page?: any;
    children: Map<string, TreeNode>;
    count: number;
    actionCount: number;
};

const ACTION_COLOR: Record<string, string> = {
    'Fix Errors':'#ef4444','Protect High-Value Page':'#eab308','Rewrite Title & Description':'#3b82f6',
    'Push to Page One':'#a855f7','Add Internal Links':'#f97316','Fix Technical Issues':'#ef4444',
    'Improve Content':'#3b82f6','Reduce Bounce Rate':'#eab308','Merge or Remove':'#9ca3af','Monitor':'#22c55e',
};

function buildTree(pages: any[]): TreeNode {
    const root: TreeNode = { name: '/', path: '/', children: new Map(), count: 0, actionCount: 0 };
    for (const page of pages) {
        let pathname = '/';
        try { pathname = new URL(page.url).pathname || '/'; } catch {}
        const segs = pathname.split('/').filter(Boolean);
        let cur = root;
        cur.count += 1;
        if (page.recommendedAction && page.recommendedAction !== 'Monitor') cur.actionCount += 1;
        const accum: string[] = [];
        segs.forEach((seg, idx) => {
            accum.push(seg);
            const segPath = '/' + accum.join('/');
            if (!cur.children.has(seg)) {
                cur.children.set(seg, { name: seg, path: segPath, children: new Map(), count: 0, actionCount: 0 });
            }
            cur = cur.children.get(seg)!;
            cur.count += 1;
            if (page.recommendedAction && page.recommendedAction !== 'Monitor') cur.actionCount += 1;
            if (idx === segs.length - 1) cur.page = page;
        });
        if (segs.length === 0) root.page = page;
    }
    return root;
}

function TreeRow({ node, depth, setSelected }: { node: TreeNode; depth: number; setSelected: (p: any) => void }) {
    const [open, setOpen] = useState(depth < 1);
    const hasKids = node.children.size > 0;
    const isLeaf  = !!node.page && !hasKids;
    const actionRatio = node.count > 0 ? node.actionCount / node.count : 0;
    const heatColor = actionRatio > 0.5 ? 'bg-red-500/15' : actionRatio > 0.2 ? 'bg-orange-500/15' : actionRatio > 0 ? 'bg-yellow-500/10' : 'bg-transparent';

    return (
        <div>
            <div
                onClick={() => { if (hasKids) setOpen(!open); if (node.page) setSelected(node.page); }}
                className={`flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#111] cursor-pointer ${heatColor}`}
                style={{ paddingLeft: 6 + depth * 12 }}
            >
                {hasKids
                    ? (open ? <ChevronDown size={10} className="text-[#666]" /> : <ChevronRight size={10} className="text-[#666]" />)
                    : <span className="w-[10px]" />}
                {isLeaf ? <FileIcon size={10} className="text-[#666]" /> : <Folder size={10} className="text-[#888]" />}
                <span className={`text-[11px] truncate flex-1 ${isLeaf ? 'text-[#ccc]' : 'text-white'}`}>{node.name}</span>
                <span className="text-[9px] font-mono text-[#666]">{node.count}</span>
                {node.actionCount > 0 && (
                    <span className="text-[9px] font-mono text-red-400">{node.actionCount}⚠</span>
                )}
            </div>
            {open && hasKids && (
                <div>
                    {[...node.children.values()]
                        .sort((a, b) => b.count - a.count)
                        .map((c) => <TreeRow key={c.path} node={c} depth={depth + 1} setSelected={setSelected} />)}
                </div>
            )}
        </div>
    );
}

export default function WqaStructureView() {
    const { filteredWqaPagesExport, graphData, setSelectedPage, fgRef } = useSeoCrawler() as any;

    const tree = useMemo(() => buildTree(filteredWqaPagesExport), [filteredWqaPagesExport]);

    const coloredNodes = useMemo(() => {
        const index = new Map(filteredWqaPagesExport.map((p: any) => [p.url, p]));
        return (graphData?.nodes || []).map((n: any) => {
            const page: any = index.get(n.fullUrl || n.id);
            const action = page?.recommendedAction || 'Monitor';
            return { ...n, color: ACTION_COLOR[action] || '#666', action, val: Math.max(1, Math.log2(n.inlinks + 2)) };
        });
    }, [graphData, filteredWqaPagesExport]);

    if (filteredWqaPagesExport.length === 0) {
        return <EmptyViewState title="Nothing to visualize yet" subtitle="Run a crawl to see the site tree and force graph." />;
    }

    return (
        <div className="flex-1 flex bg-[#070707] overflow-hidden">
            {/* Left: URL tree */}
            <aside className="w-[320px] shrink-0 border-r border-[#1a1a1a] flex flex-col">
                <div className="h-[34px] px-3 flex items-center border-b border-[#1a1a1a] shrink-0">
                    <span className="text-[10px] text-[#666] uppercase tracking-widest font-bold">URL Tree · heat = action density</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
                    <TreeRow node={tree} depth={0} setSelected={setSelectedPage} />
                </div>
            </aside>

            {/* Right: graph */}
            <div className="flex-1 relative">
                <div className="absolute top-3 left-3 z-10 bg-[#0a0a0a]/90 border border-[#222] rounded-lg px-3 py-2 text-[10px]">
                    <div className="text-[#666] uppercase tracking-widest mb-1">Node color = recommended action</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        {Object.entries(ACTION_COLOR).map(([a, c]) => (
                            <div key={a} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                                <span className="text-[#aaa]">{a}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#444] text-[11px]">Loading 3D Engine...</div>}>
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={{ nodes: coloredNodes, links: graphData?.links || [] }}
                        backgroundColor="#070707"
                        nodeLabel={(n: any) => `${n.title || n.name}\n${n.fullUrl || n.id}\nAction: ${n.action}`}
                        nodeColor={(n: any) => n.color}
                        nodeVal={(n: any) => n.val}
                        linkColor={() => 'rgba(255,255,255,0.08)'}
                        linkWidth={0.6}
                        onNodeClick={(n: any) => {
                            const page = filteredWqaPagesExport.find((p: any) => p.url === (n.fullUrl || n.id));
                            if (page) setSelectedPage(page);
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
}
