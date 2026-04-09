import React, { useRef, useEffect } from 'react';
import { ArrowDownAZ, ArrowUpAZ, EyeOff, Info } from 'lucide-react';

interface Props {
  x: number;
  y: number;
  columnKey: string;
  columnLabel: string;
  onClose: () => void;
  onSortAsc: (key: string) => void;
  onSortDesc: (key: string) => void;
  onHideColumn: (key: string) => void;
  onPinLeft?: (key: string) => void;
  onPinRight?: (key: string) => void;
  onResizeToFit?: (key: string) => void;
}

export default function ColumnHeaderContextMenu({ 
  x, y, columnKey, columnLabel, onClose, onSortAsc, onSortDesc, onHideColumn, onPinLeft, onPinRight, onResizeToFit
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Prevent menu from going off-screen
  const safeX = typeof window !== 'undefined' ? Math.min(x, window.innerWidth - 220) : x;
  const safeY = typeof window !== 'undefined' ? Math.min(y, window.innerHeight - 150) : y;

  const items = [
    { icon: <ArrowUpAZ size={13} />, label: 'Sort A-Z (Ascending)', 
      action: () => { onSortAsc(columnKey); onClose(); } },
    { icon: <ArrowDownAZ size={13} />, label: 'Sort Z-A (Descending)', 
      action: () => { onSortDesc(columnKey); onClose(); } },
    ...(onPinLeft ? [{ icon: <Info size={13} />, label: 'Pin Left', action: () => { onPinLeft(columnKey); onClose(); } }] : []),
    ...(onPinRight ? [{ icon: <Info size={13} />, label: 'Pin Right', action: () => { onPinRight(columnKey); onClose(); } }] : []),
    ...(onResizeToFit ? [{ icon: <Info size={13} />, label: 'Resize to Fit', action: () => { onResizeToFit(columnKey); onClose(); } }] : []),
    { icon: <EyeOff size={13} />, label: `Hide "${columnLabel}" Column`, 
      action: () => { onHideColumn(columnKey); onClose(); } },
  ];

  return (
    <div ref={ref} style={{ position: 'fixed', top: safeY, left: safeX, zIndex: 9999 }}
      className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl py-1 min-w-[220px] animate-in fade-in zoom-in-95 duration-150">
      <div className="px-3 py-2 border-b border-[#333] mb-1 flex items-center gap-2">
          <Info size={12} className="text-[#888]" />
          <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider">{columnLabel}</span>
      </div>
      {items.map((item, i) => (
        <button key={i} onClick={item.action}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors">
          <span className="text-[#888]">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
