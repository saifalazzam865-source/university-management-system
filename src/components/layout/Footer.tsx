import Link from 'next/link'

const FOOTER_COLS = [
  { title: 'Academic',   links: ['Faculties', 'Research', 'Library', 'Campus Life'] },
  { title: 'Admissions', links: ['Undergraduate', 'Postgraduate', 'International', 'Scholarships'] },
  { title: 'University', links: ['About', 'News', 'Events', 'Contact'] },
]

export function Footer() {
  return (
    <footer className="bg-navy-900 pt-14 pb-7" style={{ borderTop: '2px solid #C8A951' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 flex items-center justify-center text-white font-bold font-serif"
                style={{ background: '#C8A951' }}
              >
                U
              </div>
              <div>
                <div className="text-white font-serif text-sm tracking-widest">UMS</div>
                <div className="font-serif text-[10px] tracking-[0.1em]" style={{ color: 'rgba(200,169,81,0.7)' }}>
                  UNIVERSITY
                </div>
              </div>
            </div>
            <p className="text-white/50 text-sm font-serif leading-relaxed max-w-xs">
              Dedicated to the pursuit of knowledge and excellence since 1967.
            </p>
          </div>
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <div
                className="font-serif text-[11px] tracking-[0.15em] mb-5"
                style={{ color: '#C8A951' }}
              >
                {col.title.toUpperCase()}
              </div>
              {col.links.map(l => (
                <div
                  key={l}
                  className="text-white/50 text-sm font-serif mb-2.5 hover:text-white cursor-pointer transition-colors"
                >
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-3"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="text-white/40 text-xs font-serif">
            © {new Date().getFullYear()} University Management System. All rights reserved.
          </div>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Use', 'Accessibility'].map(l => (
              <span
                key={l}
                className="text-white/40 text-xs font-serif cursor-pointer hover:text-white/70"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
