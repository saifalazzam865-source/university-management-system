import { requireAdmin } from '@/lib/auth'
import { connectDB }    from '@/lib/db'
import { UserModel }    from '@/models/User'
import { FacultyModel } from '@/models/Faculty'
import { formatDate }   from '@/lib/utils'
import { StatusBadge, PageHeader, EmptyState } from '@/components/admin/ui'
import { StudentsToolbar } from '@/components/admin/StudentsToolbar'
import Link from 'next/link'

interface Props { searchParams: { search?: string; faculty?: string; status?: string } }

export default async function StudentsPage({ searchParams }: Props) {
  await requireAdmin()
  await connectDB()

  const { search = '', faculty = '', status = '' } = searchParams

  const query: Record<string, unknown> = { role: 'student' }
  if (faculty)                         query.faculty  = faculty
  if (status === 'active')             query.isActive = true
  if (status === 'inactive')           query.isActive = false
  if (search) {
    query.$or = [
      { name:      { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ]
  }

  const [students, faculties, total] = await Promise.all([
    UserModel.find(query).sort({ createdAt: -1 }).select('-password').lean(),
    FacultyModel.find({ isActive: true }).sort({ name: 1 }).select('name').lean(),
    UserModel.countDocuments({ role: 'student' }),
  ])

  const facultyNames = (faculties as any[]).map(f => f.name)

  return (
    <div className="p-6 xl:p-8 max-w-7xl mx-auto">
      <PageHeader
        label="Management"
        title="Students"
        action={
          <div className="flex items-center gap-3">
            <span className="font-serif text-xs text-gray-400">{total} total</span>
          </div>
        }
      />

      <StudentsToolbar
        faculties={facultyNames}
        currentSearch={search}
        currentFaculty={faculty}
        currentStatus={status}
      />

      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full font-serif text-sm min-w-[700px]">
          <thead>
            <tr style={{ background: '#0F2356' }}>
              {['Student', 'Student ID', 'Faculty', 'Year / GPA', 'Status', 'Joined', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-white font-normal text-xs tracking-widest uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(students as any[]).map((s, i) => (
              <tr key={i} className="hover:bg-stone-50 transition-colors group">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/students/${s._id}`} className="flex items-center gap-3 no-underline">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                                    text-xs flex-shrink-0 group-hover:ring-2 transition-all"
                         style={{ background: '#0F2356', '--tw-ring-color': '#C8A951' } as any}>
                      {s.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-navy-900 group-hover:underline">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <code className="font-mono text-xs bg-stone-100 px-2 py-0.5 text-gray-600">{s.studentId}</code>
                </td>
                <td className="px-5 py-3.5 text-gray-600 max-w-[160px]">
                  <p className="truncate">{s.faculty || '—'}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  <p>Year {s.year || 1}</p>
                  <p className="text-xs text-gray-400">GPA {s.gpa?.toFixed(2) || '—'}</p>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge value={s.isActive !== false ? 'active' : 'inactive'} />
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(s.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/students/${s._id}`}
                    className="font-serif text-xs no-underline hover:underline" style={{ color: '#C8A951' }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <EmptyState
            icon="🎓"
            title={search ? `No students matching "${search}"` : 'No students found'}
            sub={search ? 'Try a different search term or clear the filters.' : 'Students will appear here after registration.'}
          />
        )}
      </div>

      <p className="font-serif text-xs text-gray-400 text-right mt-3">
        Showing {students.length} of {total} students
      </p>
    </div>
  )
}
