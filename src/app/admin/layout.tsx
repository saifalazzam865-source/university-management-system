import { requireAdmin }    from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import { ApplicationModel } from '@/models/Application'
import { UserModel }        from '@/models/User'
import { NewsModel }        from '@/models/News'
import { AdminSidebar }     from '@/components/admin/AdminSidebar'
import { AdminTopbar }      from '@/components/admin/AdminTopbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  await connectDB()
  const [pending, submitted, students, news] = await Promise.all([
    ApplicationModel.countDocuments({ status: 'pending' }),
    ApplicationModel.countDocuments({ status: 'submitted' }),
    UserModel.countDocuments({ role: 'student' }),
    NewsModel.countDocuments({ status: 'draft' }),
  ])

  return (
    <div className="min-h-screen flex bg-stone-50">
      <AdminSidebar
        user={session.user}
        counts={{ pending, submitted, students, news }}
      />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
