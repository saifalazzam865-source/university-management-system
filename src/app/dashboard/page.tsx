import { requireStudent } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { UserModel } from '@/models/User'
import { AnnouncementModel } from '@/models/Announcement'
import { formatDate } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'badge-academic',
  general:  'badge-general',
  event:    'badge-event',
  urgent:   'badge-urgent',
}

export default async function DashboardPage() {
  const session = await requireStudent()

  await connectDB()
  const [userDoc, announcements] = await Promise.all([
    UserModel.findById(session.user.id).select('-password').lean(),
    AnnouncementModel.find().sort({ createdAt: -1 }).limit(5).lean(),
  ])

  const user = userDoc as any

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="section-label">Student Portal</p>
        <h1 className="font-serif font-normal text-navy-900 text-3xl mb-1">
          Welcome back, {session.user.name?.split(' ')[0]}
        </h1>
        <p className="font-serif text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Student ID',  value: user?.studentId || '—',   icon: '🎓' },
          { label: 'Faculty',     value: user?.faculty   || '—',   icon: '🏛'  },
          { label: 'Year',        value: `Year ${user?.year || 1}`, icon: '📅' },
          { label: 'GPA',         value: user?.gpa?.toFixed(2) || '—', icon: '📊' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5">
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="font-serif text-[11px] text-gray-400 tracking-widest uppercase mb-1">{s.label}</div>
            <div className="font-serif text-navy-900 font-normal text-lg leading-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div className="bg-white border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
          <h2 className="font-serif font-normal text-navy-900 text-lg">Latest Announcements</h2>
          <span className="badge badge-general">{announcements.length} new</span>
        </div>

        {announcements.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {(announcements as any[]).map((a, i) => (
              <div key={i} className="px-6 py-5 flex gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <span className={`badge ${CATEGORY_COLORS[a.category] || 'badge-general'}`}>
                    {a.category}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-navy-900 font-normal mb-1">{a.title}</h3>
                  <p className="font-serif text-sm text-gray-500 leading-relaxed mb-2">{a.content}</p>
                  <p className="font-serif text-xs text-gray-400">
                    Posted {formatDate(a.createdAt)} · by {a.createdBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-serif text-gray-400">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
