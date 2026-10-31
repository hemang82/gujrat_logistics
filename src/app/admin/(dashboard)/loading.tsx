export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200/80 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-28 bg-slate-200/80 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200/80 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200/80 rounded" />
              <div className="h-7 w-7 rounded-lg bg-slate-100" />
            </div>
            <div className="h-7 w-16 bg-slate-200/80 rounded-md" />
            <div className="h-2.5 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area / Table Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="h-4 w-36 bg-slate-200/80 rounded" />
          <div className="h-8 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between px-4">
              <div className="h-3 w-24 bg-slate-200/80 rounded" />
              <div className="h-3 w-32 bg-slate-200/80 rounded hidden sm:block" />
              <div className="h-3 w-20 bg-slate-200/80 rounded" />
              <div className="h-6 w-16 bg-slate-200/80 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
