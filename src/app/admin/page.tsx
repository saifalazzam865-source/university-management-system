import { requireAdmin }    from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import { UserModel }        from '@/models/User'
import { ApplicationModel } from '@/models/Application'
import { NewsModel }        from '@/models/News'
import { FacultyModel }     from '@/models/Faculty'
import { ContactModel }     from '@/models/Contact'
import { formatDate }       from '@/lib/utils'
import { StatCard, StatusBadge } from '@/components/admin/ui'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  await requireAdmin()
  await connectDB()

  const [
    totalStudents,
    activeStudents,
    totalApps,
    submittedApps,
    reviewingApps,
    acceptedApps,
    rejectedApps,
    totalFaculties,
    publishedNews,
    draftNews,
    newMessages,
    recentStudents,
    recentApps,
    recentNews,
  ] = await Promise.all([
    UserModel.countDocuments({ role: 'student' }),
    UserModel.countDocuments({ role: 'student', isActive: true }),
    ApplicationModel.countDocuments({ status: { $ne: 'draft' } }),   // exclude draft
    ApplicationModel.countDocuments({ status: 'submitted' }),
    ApplicationModel.countDocuments({ status: 'reviewing' }),
    ApplicationModel.countDocuments({ status: 'accepted' }),
    ApplicationModel.countDocuments({ status: 'rejected' }),
    FacultyModel.countDocuments({ isActive: true }),
    NewsModel.countDocuments({ status: 'published' }),
    NewsModel.countDocuments({ status: 'draft' }),
    ContactModel.countDocuments({ status: 'new' }),
    UserModel.find({ role: 'student' }).sort({ createdAt: -1 }).limit(6).select('-password').lean(),
    ApplicationModel.find({ status: { $in: ['submitted', 'reviewing'] } })
      .sort({ submittedAt: -1 }).limit(6).lean(),
    NewsModel.find().sort({ createdAt: -1 }).limit(4).lean(),
  ])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-6 xl:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label">Control Panel</p>
        <h1 className="font-serif font-normal text-navy-900 text-3xl mb-1">Dashboard</h1>
        <p className="font-serif text-xs text-gray-400">{today}</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={totalStudents}  icon="🎓" color="navy" href="/admin/students"
          sub={`${activeStudents} active`} />
        <StatCard label="Applications"   value={totalApps}      icon="📋" color="blue" href="/admin/applications"
          sub={submittedApps > 0 ? `${submittedApps} awaiting review` : undefined} />
        <StatCard label="Faculties"      value={totalFaculties} icon="🏛"  color="gold" href="/admin/faculties" />
        <StatCard label="Unread Messages" value={newMessages}   icon="✉️"  color="green" href="/admin/messages" />
      </div>

      {/* ── Application pipeline ──────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-sm text-gray-400 tracking-widest uppercase">Application Pipeline</h2>
          <Link href="/admin/applications" className="font-serif text-xs no-underline" style={{ color: '#C8A951' }}>
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Submitted',  count: submittedApps,  color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Reviewing',  count: reviewingApps,  color: '#D97706', bg: '#FFFBEB' },
            { label: 'Accepted',   count: acceptedApps,   color: '#059669', bg: '#ECFDF5' },
            { label: 'Rejected',   count: rejectedApps,   color: '#DC2626', bg: '#FEF2F2' },
          ].map(s => (
            <div key={s.label} className="text-center p-4" style={{ background: s.bg }}>
              <div className="font-serif text-2xl mb-1" style={{ color: s.color }}>{s.count}</div>
              <div className="font-serif text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        {totalApps > 0 && (
          <div className="h-1.5 flex overflow-hidden gap-0.5">
            {[
              { count: submittedApps, color: '#3B82F6' },
              { count: reviewingApps, color: '#D97706' },
              { count: acceptedApps,  color: '#059669' },
              { count: rejectedApps,  color: '#DC2626' },
            ].filter(s => s.count > 0).map((s, i) => (
              <div key={i} style={{ flex: s.count, background: s.color }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Two-column activity ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Recent students */}
        <div className="bg-white border border-stone-200">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
            <h2 className="font-serif font-normal text-navy-900 text-sm">Recent Students</h2>
            <Link href="/admin/students" className="font-serif text-xs no-underline" style={{ color: '#C8A951' }}>
              View all →
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {(recentStudents as any[]).map((s, i) => (
              <Link key={i} href={`/admin/students/${s._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors no-underline group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-serif
                                font-bold text-xs flex-shrink-0" style={{ background: '#0F2356' }}>
                  {s.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-sm text-navy-900 truncate group-hover:underline">{s.name}</p>
                  <p className="font-serif text-xs text-gray-400 truncate">{s.faculty}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <StatusBadge value={s.isActive !== false ? 'active' : 'inactive'} />
                </div>
              </Link>
            ))}
            {recentStudents.length === 0 && (
              <p className="px-5 py-10 text-center font-serif text-sm text-gray-400">No students yet</p>
            )}
          </div>
        </div>

        {/* Pending applications */}
        <div className="bg-white border border-stone-200">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
            <h2 className="font-serif font-normal text-navy-900 text-sm">Needs Review</h2>
            <Link href="/admin/applications?status=submitted" className="font-serif text-xs no-underline" style={{ color: '#C8A951' }}>
              View all →
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {(recentApps as any[]).map((a, i) => (
              <Link key={i} href={`/admin/applications/${a._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors no-underline group">
                <div className="w-8 h-8 flex items-center justify-center font-serif text-xs flex-shrink-0 bg-stone-100 text-gray-500">
                  {(a.firstName ?? '?')[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-sm text-navy-900 truncate group-hover:underline">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="font-serif text-xs text-gray-400 truncate">{a.faculty} · {a.program}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <StatusBadge value={a.status} />
                  <p className="font-mono text-[9px] text-gray-300 mt-1">{a.applicationRef}</p>
                </div>
              </Link>
            ))}
            {recentApps.length === 0 && (
              <p className="px-5 py-10 text-center font-serif text-sm text-gray-400">No pending applications</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent news */}
      <div className="bg-white border border-stone-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
          <h2 className="font-serif font-normal text-navy-900 text-sm">Recent News Articles</h2>
          <Link href="/admin/news" className="font-serif text-xs no-underline" style={{ color: '#C8A951' }}>
            Manage →
          </Link>
        </div>
        <div className="divide-y divide-stone-50">
          {(recentNews as any[]).map((n, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm text-navy-900 truncate">{n.title}</p>
                <p className="font-serif text-xs text-gray-400 truncate">{n.excerpt}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge value={n.category} />
                <StatusBadge value={n.status} />
              </div>
            </div>
          ))}
          {recentNews.length === 0 && (
            <p className="px-5 py-8 text-center font-serif text-sm text-gray-400">
              No articles yet.{' '}
              <Link href="/admin/news" className="no-underline" style={{ color: '#C8A951' }}>Create one →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
