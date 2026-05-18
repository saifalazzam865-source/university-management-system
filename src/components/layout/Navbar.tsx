'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

const NAV_LINKS = [
  { label: 'Home',       href: '/#home'       },
  { label: 'About',      href: '/#about'      },
  { label: 'Faculties',  href: '/#faculties'  },
  { label: 'Admissions', href: '/#admissions' },
  { label: 'News',       href: '/#news'       },
  { label: 'Contact',    href: '/#contact'    },
]

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dashboardHref = session?.user.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow ${scrolled ? 'shadow-lg' : ''}`}
      style={{ background: '#0F2356', borderBottom: '1px solid rgba(200,169,81,0.25)' }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-9 h-9 flex items-center justify-center text-white font-bold font-serif text-base"
            style={{ background: '#C8A951' }}
          >
            U
          </div>
          <div>
            <div className="text-white font-serif text-sm tracking-widest leading-none">UMS</div>
            <div className="font-serif text-[10px] tracking-[0.14em]" style={{ color: '#C8A951' }}>
              UNIVERSITY
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} className="nav-link no-underline">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="text-gold-400 font-serif text-sm tracking-wide hover:text-gold-300 no-underline"
              >
                {session.user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'} →
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn-outline-white text-xs px-4 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login"    className="btn-outline-white text-xs px-4 py-2 no-underline">Sign In</Link>
              <Link href="/register" className="btn-primary text-xs px-4 py-2 no-underline">Apply Now</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-3"
          style={{ background: '#0F2356', borderColor: 'rgba(200,169,81,0.2)' }}
        >
          {NAV_LINKS.map(l => (
            <Link
              key={l.label}
              href={l.href}
              className="nav-link no-underline py-2"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="nav-link no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-left nav-link"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login"    className="nav-link no-underline" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className="nav-link no-underline" onClick={() => setMenuOpen(false)}>Apply Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
