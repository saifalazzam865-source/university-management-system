import { requireAdmin } from '@/lib/auth'
import { connectDB }    from '@/lib/db'
import { FacultyModel } from '@/models/Faculty'
import { StatusBadge, PageHeader, EmptyState } from '@/components/admin/ui'
import { FacultiesClient } from '@/components/admin/FacultiesClient'

export default async function FacultiesPage() {
  await requireAdmin()
  await connectDB()
  const faculties = await FacultyModel.find().sort({ order: 1, name: 1 }).lean()

  return (
    <div className="p-6 xl:p-8 max-w-6xl mx-auto">
      <PageHeader label="Academic" title="Faculties" />
      <FacultiesClient initialFaculties={JSON.parse(JSON.stringify(faculties))} />
    </div>
  )
}
