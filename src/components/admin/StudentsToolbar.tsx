'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  faculties:      string[]
  currentSearch:  string
  currentFaculty: string
  currentStatus:  string
}

export function StudentsToolbar({ faculties, currentSearch, currentFaculty, currentStatus }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const [, startT]  = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const navigate = (overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    const final  = { search, faculty: currentFaculty, status: currentStatus, ...overrides }
    Object.entries(final).forEach(([k, v]) => { if (v) params.set(k, v) })
    startT(() => router.push(`${pathname}?${params.toString()}`))
  }

  const STATUS_TABS = [
    { value: '',         label: 'All'      },
    { value: 'active',   label: 'Active'   },
    { value: 'inactive', label: 'Inactive' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      {/* Search */}
      <form onSubmit={e => { e.preventDefault(); navigate({ search }) }} className="flex gap-2 flex-1">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input max-w-xs"
          placeholder="Search name, email, ID…"
        />
        <button type="submit" className="px-4 py-2 font-serif text-xs text-white cursor-pointer"
                style={{ background: '#0F2356' }}>
          Search
        </button>
        {(search || currentSearch) && (
          <button type="button" onClick={() => { setSearch(''); navigate({ search: '' }) }}
            className="px-3 py-2 font-serif text-xs text-gray-400 hover:text-gray-700 border border-stone-200
                       hover:bg-stone-50 transition-colors cursor-pointer">
            ×
          </button>
        )}
      </form>

      <div className="flex gap-2 flex-wrap">
        {/* Faculty filter */}
        <select
          value={currentFaculty}
          onChange={e => navigate({ faculty: e.target.value })}
          className="form-input w-auto text-xs py-2"
        >
          <option value="">All Faculties</option>
          {faculties.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Status filter */}
        <div className="flex border border-stone-200 overflow-hidden">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => navigate({ status: tab.value })}
              className={`px-3 py-2 font-serif text-xs transition-colors cursor-pointer ${
                currentStatus === tab.value
                  ? 'text-white'
                  : 'text-gray-500 hover:bg-stone-50 bg-white'
              }`}
              style={currentStatus === tab.value ? { background: '#0F2356' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
