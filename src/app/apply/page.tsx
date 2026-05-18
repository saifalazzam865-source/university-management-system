import Link               from 'next/link'
import { Navbar }          from '@/components/layout/Navbar'
import { Footer }          from '@/components/layout/Footer'
import { ApplicationForm } from '@/components/apply/ApplicationForm'

export const metadata = {
  title:       'Apply for Admission — University Management System',
  description: 'Start your application to University Management System. Undergraduate and postgraduate programs available.',
}

export default function ApplyPage() {
  return (
    <>
      <Navbar />

      {/* Page hero */}
      <div className="pt-16" style={{ background: '#0F2356' }}>
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link href="/#admissions"
            className="font-serif text-xs no-underline tracking-widest mb-4 inline-block"
            style={{ color: '#C8A951' }}>
            ← BACK TO ADMISSIONS
          </Link>
          <h1 className="font-serif font-normal text-white text-4xl mb-3">Apply for Admission</h1>
          <p className="font-serif text-white/65 leading-relaxed max-w-xl">
            Complete all four steps to submit your application. Your progress is saved automatically —
            you can upload your documents at any pace.
          </p>
        </div>
      </div>

      {/* Sidebar + form layout */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-5">

              <div className="bg-white border border-stone-200 p-5">
                <p className="font-serif text-[11px] tracking-widest text-gray-400 uppercase mb-4">What to Prepare</p>
                {[
                  { icon: '📄', label: 'Academic transcript (PDF)' },
                  { icon: '🪪', label: 'National ID or passport (scan)' },
                  { icon: '🖼️', label: 'Recent personal photo (JPG/PNG)' },
                  { icon: '📝', label: 'Recommendation letter (optional)' },
                  { icon: '📋', label: 'CV or resume (optional)' },
                  { icon: '🌐', label: 'English cert. (IELTS/TOEFL) if applicable' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-none">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="font-serif text-sm text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="border-l-4 pl-4" style={{ borderColor: '#C8A951' }}>
                <p className="font-serif text-sm text-navy-900 mb-2">Need help?</p>
                <p className="font-serif text-xs text-gray-500 leading-relaxed mb-2">
                  Our admissions team is here to assist you every step of the way.
                </p>
                <a href="mailto:admissions@ums.edu"
                   className="font-serif text-xs no-underline" style={{ color: '#C8A951' }}>
                  admissions@ums.edu
                </a>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-5">
                <p className="font-serif text-[11px] tracking-widest text-gray-400 uppercase mb-3">Deadlines</p>
                {[
                  { label: 'Undergraduate', date: 'April 30, 2026' },
                  { label: 'Postgraduate',  date: 'Rolling'        },
                  { label: 'Scholarships',  date: 'March 15, 2026' },
                ].map((d, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-stone-200 last:border-none">
                    <span className="font-serif text-xs text-gray-600">{d.label}</span>
                    <span className="font-serif text-xs" style={{ color: '#C8A951' }}>{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Form */}
          <main className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-stone-200 p-8">
              <ApplicationForm />
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
