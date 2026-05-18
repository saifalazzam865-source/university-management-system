export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-pulse">
      <div className="mb-10">
        <div className="h-2.5 w-20 bg-stone-200 rounded mb-3" />
        <div className="h-8 w-56 bg-stone-200 rounded mb-2" />
        <div className="h-3 w-44 bg-stone-100 rounded" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5">
            <div className="text-2xl mb-3 opacity-30">□</div>
            <div className="h-2.5 w-20 bg-stone-200 rounded mb-2" />
            <div className="h-5 w-28 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="h-5 w-44 bg-stone-200 rounded" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-6 py-5 flex gap-4 border-b border-stone-100">
            <div className="w-16 h-5 bg-stone-200 rounded flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-64 bg-stone-200 rounded mb-2" />
              <div className="h-3 w-full bg-stone-100 rounded mb-1.5" />
              <div className="h-3 w-3/4 bg-stone-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
