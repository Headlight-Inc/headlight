import React, { useMemo } from 'react';
import { useSeoCrawler } from '../../../../../contexts/SeoCrawlerContext';

interface Props { pages: any[] }

interface TreeNode {
    name: string;
    path: string;
    count: number;
    issues: number;
    children: Map<string, TreeNode>;
    sample?: any;
}

function buildTree(pages: any[]): TreeNode {
    const root: TreeNode = { name: '/', path: '/', count: 0, issues: 0, children: new Map() };
    for (const p of pages) {
        try {
            const segs = new URL(p.url).pathname.split('/').filter(Boolean);
            let node = root;
            node.count++;
            if (p.statusCode >= 400 || p.indexable === false) node.issues++;
            for (const seg of segs) {
                if (!node.children.has(seg)) {
                    node.children.set(seg, { name: seg, path: `${node.path === '/' ? '' : node.path}/${seg}`, count: 0, issues: 0, children: new Map() });
                }
                node = node.children.get(seg)!;
                node.count++;
                if (p.statusCode >= 400 || p.indexable === false) node.issues++;
                node.sample = p;
            }
        } catch { /* skip */ }
    }
    return root;
}

export default function MapTreeMode({ pages }: Props) {
    const { setSelectedPage } = useSeoCrawler() as any;
    const tree = useMemo(() => buildTree(pages), [pages]);

    const render = (node: TreeNode, depth = 0): React.ReactNode => {
        const kids = Array.from(node.children.values()).sort((a, b) => b.count - a.count);
        return (
            <ul className={depth === 0 ? 'list-none pl-0' : 'list-none pl-4 border-l border-[#1a1a1a]'}>
                {kids.map(k => {
                    const bad = k.issues / Math.max(1, k.count);
                    const tone = bad > 0.2 ? '#ef4444' : bad > 0.05 ? '#f59e0b' : '#22c55e';
                    return (
                        <li key={k.path} className="py-0.5">
                            <button
                                onClick={() => k.sample && setSelectedPage?.(k.sample)}
                                className="group flex items-center gap-2 text-left w-full px-2 py-1 rounded hover:bg-[#111]"
                            >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tone }} />
                                <span className="text-[12px] font-mono text-white truncate">{k.name}</span>
                                <span className="text-[10px] text-[#555] ml-auto pl-2 shrink-0">
                                    {k.count.toLocaleString()}{k.issues > 0 && <span className="text-red-400"> · {k.issues} issues</span>}
                                </span>
                            </button>
                            {k.children.size > 0 && depth < 5 && render(k, depth + 1)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="absolute inset-0 overflow-auto custom-scrollbar p-6">
            <div className="max-w-3xl">
                <div className="text-[10px] uppercase tracking-widest text-[#555] mb-2">Root</div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5364E]" />
                    <span className="text-[12px] font-mono text-white">/</span>
                    <span className="text-[10px] text-[#555] ml-auto">{tree.count.toLocaleString()} pages</span>
                </div>
                {render(tree)}
            </div>
        </div>
    );
}
