import React from 'react';

export const SkeletonRow = () => (
  <div className="flex gap-4 py-2 animate-pulse">
    <div className="h-4 w-64 rounded bg-[#1a1a1a]" />
    <div className="h-4 w-16 rounded bg-[#1a1a1a]" />
    <div className="h-4 w-48 rounded bg-[#1a1a1a]" />
    <div className="h-4 w-12 rounded bg-[#1a1a1a]" />
  </div>
);

export const SkeletonChart = () => (
  <div className="rounded-lg border border-[#222] bg-[#111] p-4 animate-pulse">
    <div className="mb-4 h-4 w-32 rounded bg-[#1a1a1a]" />
    <div className="h-[200px] rounded bg-[#1a1a1a]" />
  </div>
);

export const SkeletonTable = ({ rows = 10 }: { rows?: number }) => (
  <div className="space-y-1">
    {Array.from({ length: rows }).map((_, index) => (
      <SkeletonRow key={index} />
    ))}
  </div>
);
