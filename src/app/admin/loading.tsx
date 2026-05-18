export default function AdminLoading() {
  return (
    <div className="p-6 xl:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-2.5 w-24 bg-stone-200 rounded mb-3" />
        <div className="h-8 w-48 bg-stone-200 rounded" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5 h-28">
            <div className="w-10 h-10 bg-stone-200 rounded mb-4" />
            <div className="h-8 w-12 bg-stone-100 rounded mb-1" />
            <div className="h-2.5 w-20 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-stone-200">
            <div className="px-5 py-4 border-b border-stone-100">
              <div className="h-4 w-36 bg-stone-200 rounded" />
            </div>
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="px-5 py-3.5 flex items-center gap-3 border-b border-stone-50">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-40 bg-stone-200 rounded mb-1.5" />
                  <div className="h-2.5 w-28 bg-stone-100 rounded" />
                </div>
                <div className="h-5 w-14 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
