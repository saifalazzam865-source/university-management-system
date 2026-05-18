import { requireStudent } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStudent()

  return (
    <div className="min-h-screen flex bg-stone-50">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
