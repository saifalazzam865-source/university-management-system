'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Props {
  user: { name?: string | null; email?: string | null; studentId?: string; role: string }
}

const NAV = [
  { href: '/dashboard',               icon: '⬛', label: 'Overview'      },
  { href: '/dashboard/announcements', icon: '📢', label: 'Announcements' },
  { href: '/dashboard/profile',       icon: '👤', label: 'My Profile'    },
]

export function DashboardSidebar({ user }: Props) {
  const path = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-stone-200 bg-white min-h-screen">
      {/* Brand */}
      <div className="p-6 border-b border-stone-200" style={{ background: '#0F2356' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline mb-5">
          <div
            className="w-8 h-8 flex items-center justify-center text-white font-bold font-serif text-sm"
            style={{ background: '#C8A951' }}
          >
            U
          </div>
          <div>
            <div className="text-white font-serif text-xs tracking-widest leading-none">UMS</div>
            <div className="font-serif text-[9px] tracking-[0.12em]" style={{ color: 'rgba(200,169,81,0.7)' }}>
              UNIVERSITY
            </div>
          </div>
        </Link>

        {/* Student card */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif
                       font-bold text-sm flex-shrink-0"
            style={{ background: '#C8A951', color: '#0F2356' }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white font-serif text-sm truncate">{user.name}</div>
            <div className="text-white/50 font-serif text-xs">{user.studentId || 'Student'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        <p className="font-serif text-[10px] tracking-[0.15em] text-gray-400 px-3 py-2 mt-2">
          STUDENT PORTAL
        </p>
        {NAV.map(item => {
          const active =
            item.href === '/dashboard'
              ? path === '/dashboard'
              : path.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 font-serif text-sm no-underline
                          transition-colors rounded-sm ${
                active
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-stone-100 hover:text-navy-900'
              }`}
              style={active ? { background: '#0F2356' } : {}}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-stone-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 font-serif text-sm text-gray-500
                     hover:text-navy-900 no-underline transition-colors"
        >
          <span>🌐</span> University Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 font-serif text-sm text-gray-500
                     hover:text-red-600 transition-colors text-left cursor-pointer"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
