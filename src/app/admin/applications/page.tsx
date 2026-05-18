import { requireAdmin } from '@/lib/auth'
import { connectDB }    from '@/lib/db'
import { ApplicationModel } from '@/models/Application'
import { formatDate }   from '@/lib/utils'
import Link             from 'next/link'

interface Props {
  searchParams: { status?: string; search?: string }
}

const STATUS_OPTIONS = ['all', 'submitted', 'reviewing', 'accepted', 'rejected'] as const

const STATUS_COLORS: Record<string, string> = {
  draft:     'badge-general',
  submitted: 'badge-reviewing',
  reviewing: 'badge-pending',
  accepted:  'badge-accepted',
  rejected:  'badge-rejected',
}

const DOC_REQUIRED = ['transcript', 'nationalId', 'personalPhoto']

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await requireAdmin()
  await connectDB()

  const activeStatus = searchParams.status || 'all'
  const searchQuery  = searchParams.search  || ''

  const query: Record<string, unknown> = {}
  if (activeStatus !== 'all') query.status = activeStatus
  if (searchQuery) {
    query.$or = [
      { firstName:      { $regex: searchQuery, $options: 'i' } },
      { lastName:       { $regex: searchQuery, $options: 'i' } },
      { email:          { $regex: searchQuery, $options: 'i' } },
      { applicationRef: { $regex: searchQuery, $options: 'i' } },
      { faculty:        { $regex: searchQuery, $options: 'i' } },
    ]
  }

  const [applications, allApps] = await Promise.all([
    ApplicationModel.find(query).sort({ submittedAt: -1, createdAt: -1 }).lean(),
    ApplicationModel.find({}).select('status').lean(),
  ])

  const counts = {
    all:       allApps.length,
    submitted: allApps.filter(a => a.status === 'submitted').length,
    reviewing: allApps.filter(a => a.status === 'reviewing').length,
    accepted:  allApps.filter(a => a.status === 'accepted').length,
    rejected:  allApps.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label">Admissions</p>
        <h1 className="font-serif font-normal text-navy-900 text-3xl">Applications</h1>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-stone-200 pb-0">
        {STATUS_OPTIONS.map(s => {
          const active = s === activeStatus
          const count  = counts[s as keyof typeof counts]
          return (
            <Link key={s} href={`/admin/applications?status=${s}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`font-serif text-sm px-5 py-2.5 no-underline capitalize transition-colors border-b-2 -mb-px
                ${active
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {s} <span className="ml-1 font-mono text-xs text-gray-400">{count}</span>
            </Link>
          )
        })}
      </div>

      {/* Search */}
      <form method="GET" className="mb-6 flex gap-3">
        {activeStatus !== 'all' && (
          <input type="hidden" name="status" value={activeStatus} />
        )}
        <input name="search" defaultValue={searchQuery}
          className="form-input max-w-xs"
          placeholder="Search name, email, ref…" />
        <button type="submit" className="btn-primary px-5 py-2.5 text-xs">Search</button>
        {searchQuery && (
          <Link href={`/admin/applications?status=${activeStatus}`}
            className="font-serif text-sm text-gray-500 hover:text-navy-900 no-underline flex items-center px-2">
            Clear ×
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full font-serif text-sm min-w-[700px]">
          <thead>
            <tr style={{ background: '#0F2356' }}>
              {['Reference', 'Applicant', 'Faculty / Program', 'GPA', 'Docs', 'Status', 'Submitted'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-white font-normal text-xs tracking-widest uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(applications as any[]).map((a, i) => {
              const docsOk = DOC_REQUIRED.every(k => a.documents?.some((d: any) => d.fieldKey === k))
              return (
                <tr key={i} className="hover:bg-stone-50 transition-colors group cursor-pointer">
                  <td className="px-5 py-4">
                    <Link href={`/admin/applications/${a._id}`}
                      className="font-mono text-xs text-gold-600 no-underline group-hover:underline">
                      {a.applicationRef}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/applications/${a._id}`} className="no-underline block">
                      <p className="text-navy-900 group-hover:underline">
                        {a.firstName} {a.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{a.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <p className="truncate max-w-[160px]">{a.faculty}</p>
                    <p className="text-xs text-gray-400 capitalize">{a.program}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {a.gpa != null ? Number(a.gpa).toFixed(2) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-serif text-xs ${docsOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {a.documents?.length || 0} files
                      {!docsOk && ' ⚠'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${STATUS_COLORS[a.status] || 'badge-general'} capitalize`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {a.submittedAt ? formatDate(a.submittedAt) : <span className="text-stone-300">Draft</span>}
                  </td>
                </tr>
              )
            })}
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-20 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-serif text-gray-400">
                    {searchQuery ? `No applications matching "${searchQuery}"` : 'No applications yet'}
                  </p>
                  {searchQuery && (
                    <Link href="/admin/applications" className="font-serif text-xs no-underline mt-2 inline-block"
                          style={{ color: '#C8A951' }}>Clear search</Link>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {applications.length > 0 && (
        <p className="font-serif text-xs text-gray-400 text-right mt-3">
          Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
