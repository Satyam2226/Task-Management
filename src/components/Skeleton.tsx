import React from 'react';
import { cn } from '../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-slate-200 rounded-md", className)} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);
