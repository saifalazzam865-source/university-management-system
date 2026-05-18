import { requireStudent } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { AnnouncementModel } from '@/models/Announcement'
import { formatDate } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'badge-academic',
  general:  'badge-general',
  event:    'badge-event',
  urgent:   'badge-urgent',
}

export default async function AnnouncementsPage() {
  await requireStudent()
  await connectDB()
  const announcements = await AnnouncementModel.find().sort({ createdAt: -1 }).lean()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <p className="section-label">Bulletin Board</p>
      <h1 className="font-serif font-normal text-navy-900 text-3xl mb-10">Announcements</h1>

      {announcements.length > 0 ? (
        <div className="flex flex-col gap-4">
          {(announcements as any[]).map((a, i) => (
            <div key={i} className="bg-white border border-stone-200 p-6">
              <div className="flex justify-between items-start mb-3 gap-3 flex-wrap">
                <span className={`badge ${CATEGORY_COLORS[a.category] || 'badge-general'}`}>
                  {a.category}
                </span>
                <span className="font-serif text-xs text-gray-400">{formatDate(a.createdAt)}</span>
              </div>
              <h2 className="font-serif font-normal text-navy-900 text-xl mb-3">{a.title}</h2>
              <p className="font-serif text-gray-600 leading-relaxed mb-3">{a.content}</p>
              <p className="font-serif text-xs text-gray-400">Posted by {a.createdBy}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 px-8 py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="font-serif font-normal text-navy-900 text-xl mb-2">No announcements yet</h2>
          <p className="font-serif text-gray-400">Check back later for university updates.</p>
        </div>
      )}
    </div>
  )
}
