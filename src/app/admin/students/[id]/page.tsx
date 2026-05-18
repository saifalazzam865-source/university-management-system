import { requireAdmin } from '@/lib/auth'
import { connectDB }    from '@/lib/db'
import { UserModel }    from '@/models/User'
import { ApplicationModel } from '@/models/Application'
import { FacultyModel } from '@/models/Faculty'
import { formatDate }   from '@/lib/utils'
import { notFound }     from 'next/navigation'
import Link             from 'next/link'
import { StatusBadge }  from '@/components/admin/ui'
import { StudentEditForm }   from '@/components/admin/StudentEditForm'

interface Props { params: { id: string } }

export default async function StudentDetailPage({ params }: Props) {
  await requireAdmin()
  await connectDB()

  const [student, faculties] = await Promise.all([
    UserModel.findById(params.id).select('-password').lean(),
    FacultyModel.find({ isActive: true }).sort({ name: 1 }).select('name').lean(),
  ])

  if (!student) notFound()

  const s          = student as any
  const facultyNames = (faculties as any[]).map(f => f.name)

  const applications = await ApplicationModel
    .find({ email: s.email })
    .sort({ submittedAt: -1 })
    .lean() as any[]

  return (
    <div className="p-6 xl:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/students"
          className="font-serif text-xs tracking-widest no-underline" style={{ color: '#C8A951' }}>
          ← STUDENTS
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — profile */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile card */}
          <div className="bg-white border border-stone-200">
            <div className="px-6 py-5 flex items-center gap-5" style={{ background: '#0F2356' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-serif
                              font-bold flex-shrink-0" style={{ background: '#C8A951', color: '#0F2356' }}>
                {s.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-normal text-white text-2xl mb-1 truncate">{s.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-xs px-2 py-0.5" style={{ background: 'rgba(200,169,81,0.2)', color: '#C8A951' }}>
                    {s.studentId}
                  </code>
                  <StatusBadge value={s.isActive !== false ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
              {[
                { label: 'Email',    value: s.email },
                { label: 'Phone',    value: s.phone || '—' },
                { label: 'Faculty',  value: s.faculty || '—' },
                { label: 'Year',     value: `Year ${s.year || 1}` },
                { label: 'GPA',      value: s.gpa != null ? `${Number(s.gpa).toFixed(2)} / 4.0` : '—' },
                { label: 'Joined',   value: formatDate(s.createdAt) },
              ].map((r, i) => (
                <div key={i} className="px-5 py-4 border-b border-stone-100 last:border-b-0">
                  <p className="font-serif text-[10px] text-gray-400 tracking-widest uppercase mb-1">{r.label}</p>
                  <p className="font-serif text-sm text-gray-700">{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Applications history */}
          <div className="bg-white border border-stone-200">
            <div className="px-5 py-3.5 border-b border-stone-100" style={{ background: '#0F2356' }}>
              <span className="font-serif text-white text-sm">Application History</span>
            </div>
            {applications.length === 0 ? (
              <p className="px-5 py-8 font-serif text-sm text-gray-400 text-center">No applications found for this student.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {applications.map((a, i) => (
                  <Link key={i} href={`/admin/applications/${a._id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 no-underline group transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm text-navy-900 group-hover:underline">
                        {a.faculty} — {a.program}
                      </p>
                      <p className="font-mono text-[10px] text-gray-400">{a.applicationRef}</p>
                    </div>
                    <StatusBadge value={a.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — edit panel */}
        <div className="space-y-5">
          <div className="bg-white border border-stone-200">
            <div className="px-5 py-3.5 border-b border-stone-100" style={{ background: '#0F2356' }}>
              <span className="font-serif text-white text-sm">Edit Student</span>
            </div>
            <div className="p-5">
              <StudentEditForm student={s} faculties={facultyNames} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
