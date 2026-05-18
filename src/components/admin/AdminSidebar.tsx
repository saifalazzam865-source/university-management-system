'use client'
import { useState }    from 'react'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut }     from 'next-auth/react'

interface NavItem {
  href:   string
  icon:   string
  label:  string
  badge?: number | string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface Props {
  user:   { name?: string | null; email?: string | null; role: string }
  counts: { pending: number; submitted: number; students: number; news: number }
}

export function AdminSidebar({ user, counts }: Props) {
  const path            = usePathname()
  const [open, setOpen] = useState(false)

  const GROUPS: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { href: '/admin', icon: '◼', label: 'Dashboard' },
      ],
    },
    {
      label: 'People',
      items: [
        { href: '/admin/students',     icon: '🎓', label: 'Students',     badge: counts.students || undefined },
        { href: '/admin/applications', icon: '📋', label: 'Applications', badge: counts.submitted > 0 ? counts.submitted : undefined },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/admin/faculties',     icon: '🏛',  label: 'Faculties'     },
        { href: '/admin/news',          icon: '📰',  label: 'News',         badge: counts.news || undefined },
        { href: '/admin/announcements', icon: '📢',  label: 'Announcements' },
      ],
    },
  ]

  const isActive = (href: string) =>
    href === '/admin' ? path === '/admin' : path.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className="flex-shrink-0 px-5 py-5 border-b"
        style={{ background: '#0F2356', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 no-underline mb-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-8 h-8 flex items-center justify-center font-serif font-bold text-sm"
            style={{ background: '#C8A951', color: '#0F2356' }}
          >
            U
          </div>
          <div>
            <div className="text-white font-serif text-xs tracking-[0.18em] leading-none">UMS</div>
            <div className="font-serif text-[9px] tracking-[0.12em]" style={{ color: '#C8A951' }}>
              ADMIN PANEL
            </div>
          </div>
        </Link>

        {/* Admin identity card */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm flex-shrink-0"
            style={{ background: '#C8A951', color: '#0F2356' }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white font-serif text-xs truncate leading-none mb-0.5">{user.name}</div>
            <div className="font-serif text-[10px]" style={{ color: 'rgba(200,169,81,0.8)' }}>
              Administrator
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {GROUPS.map(group => (
          <div key={group.label}>
            <p className="font-serif text-[9px] tracking-[0.2em] text-gray-400 px-3 mb-1.5 uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 font-serif text-sm no-underline
                                transition-colors rounded-sm group ${
                      active
                        ? 'text-white'
                        : 'text-gray-500 hover:bg-stone-100 hover:text-gray-900'
                    }`}
                    style={active ? { background: '#0F2356' } : {}}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex-shrink-0"
                        style={
                          active
                            ? { background: '#C8A951', color: '#0F2356' }
                            : { background: '#FEF3C7', color: '#92400E' }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-stone-100 p-3 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 font-serif text-xs text-gray-400
                     hover:text-gray-700 no-underline transition-colors rounded-sm hover:bg-stone-50"
          onClick={() => setOpen(false)}
        >
          <span className="w-5 text-center">🌐</span> Public Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 font-serif text-xs text-gray-400
                     hover:text-red-600 transition-colors text-left rounded-sm hover:bg-red-50 cursor-pointer"
        >
          <span className="w-5 text-center">→</span> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 xl:w-60 flex-shrink-0 flex-col border-r border-stone-200
                        bg-white min-h-screen sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 flex items-center justify-center
                   bg-navy-900 text-white shadow-lg"
        style={{ background: '#0F2356' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect y="2"  width="16" height="1.5" rx="0.75" fill="currentColor"/>
          <rect y="7"  width="16" height="1.5" rx="0.75" fill="currentColor"/>
          <rect y="12" width="16" height="1.5" rx="0.75" fill="currentColor"/>
        </svg>
      </button>

      {/* Mobile: overlay drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <span className="font-serif text-xs tracking-widest text-gray-500">MENU</span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
