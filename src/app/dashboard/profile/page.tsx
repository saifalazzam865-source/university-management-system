import { requireStudent } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { UserModel } from '@/models/User'
import { formatDate } from '@/lib/utils'

export default async function ProfilePage() {
  const session = await requireStudent()
  await connectDB()
  const user = await UserModel.findById(session.user.id).select('-password').lean() as any

  const rows = [
    { label: 'Full Name',   value: user?.name           },
    { label: 'Email',       value: user?.email          },
    { label: 'Student ID',  value: user?.studentId      },
    { label: 'Faculty',     value: user?.faculty        },
    { label: 'Year',        value: `Year ${user?.year}` },
    { label: 'Phone',       value: user?.phone || '—'   },
    { label: 'GPA',         value: user?.gpa?.toFixed(2) || '0.00' },
    { label: 'Member Since',value: user?.createdAt ? formatDate(user.createdAt) : '—' },
  ]

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <p className="section-label">Account</p>
      <h1 className="font-serif font-normal text-navy-900 text-3xl mb-10">My Profile</h1>

      <div className="bg-white border border-stone-200">
        {/* Avatar header */}
        <div className="px-8 py-8 border-b border-stone-200 flex items-center gap-5"
             style={{ background: '#0F2356' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-serif
                          font-bold text-2xl flex-shrink-0" style={{ background: '#C8A951' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-serif font-normal text-white text-xl mb-1">{user?.name}</h2>
            <p className="font-serif text-sm" style={{ color: '#C8A951' }}>
              {user?.faculty} · {user?.studentId}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-stone-100">
          {rows.map((r, i) => (
            <div key={i} className="px-8 py-4 flex justify-between items-center">
              <span className="font-serif text-xs text-gray-400 tracking-widest uppercase w-36">
                {r.label}
              </span>
              <span className="font-serif text-gray-700 text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="font-serif text-xs text-gray-400 mt-4 text-center">
        To update your information, please contact the registrar's office.
      </p>
    </div>
  )
}
