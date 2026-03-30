import React from "react";

export default function CourseCardSkeleton() {
  return (
    <div className="shadow-sm rounded-lg border p-2 mt-4 animate-pulse">
      <div className="w-full h-[200px] bg-slate-200 rounded-lg" />
      <div className="p-2 space-y-2 mt-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-6 bg-slate-200 rounded w-24" />
          <div className="h-6 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
