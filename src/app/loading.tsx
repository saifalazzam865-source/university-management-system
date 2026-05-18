export default function Loading() {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-pulse">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-2.5 w-20 bg-stone-200 rounded mb-3" />
        <div className="h-8 w-64 bg-stone-200 rounded mb-2" />
        <div className="h-2.5 w-40 bg-stone-100 rounded" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5">
            <div className="w-8 h-8 bg-stone-200 rounded mb-4" />
            <div className="h-2 w-16 bg-stone-200 rounded mb-2" />
            <div className="h-6 w-24 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-white border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="h-5 w-48 bg-stone-200 rounded" />
        </div>
        <div className="divide-y divide-stone-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-stone-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 w-48 bg-stone-200 rounded mb-2" />
                <div className="h-2.5 w-32 bg-stone-100 rounded" />
              </div>
              <div className="h-5 w-16 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
