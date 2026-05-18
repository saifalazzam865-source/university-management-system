import { requireAdmin }    from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import { AnnouncementModel } from '@/models/Announcement'
import { formatDate }        from '@/lib/utils'
import { PageHeader, StatusBadge } from '@/components/admin/ui'
import { AnnouncementsClient } from '@/components/admin/AnnouncementsClient'

export default async function AnnouncementsPage() {
  await requireAdmin()
  await connectDB()
  const items = await AnnouncementModel.find().sort({ createdAt: -1 }).lean()

  return (
    <div className="p-6 xl:p-8 max-w-5xl mx-auto">
      <PageHeader label="Communications" title="Announcements" />
      <AnnouncementsClient initialItems={JSON.parse(JSON.stringify(items))} />
    </div>
  )
}
