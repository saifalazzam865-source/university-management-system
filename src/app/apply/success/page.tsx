import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface Props {
  searchParams: { ref?: string }
}

export default function ApplicationSuccessPage({ searchParams }: Props) {
  const ref = searchParams.ref || 'APP-2026-XXXXX'

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen flex items-center" style={{ background: '#FAFAF8' }}>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center w-full">

          {/* Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-8"
               style={{ background: '#0F2356' }}>
            ✓
          </div>

          <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: '#C8A951' }} />

          <h1 className="font-serif font-normal text-navy-900 text-4xl mb-4">
            Application Submitted
          </h1>
          <p className="font-serif text-gray-500 leading-relaxed mb-8 text-lg">
            Thank you for applying to University Management System. Your application has been received
            and is now under review by our admissions committee.
          </p>

          {/* Reference card */}
          <div className="bg-white border border-stone-200 p-8 mb-8">
            <p className="font-serif text-[11px] text-gray-400 tracking-widest uppercase mb-2">
              Your Application Reference
            </p>
            <p className="font-serif text-3xl text-navy-900 mb-4" style={{ letterSpacing: '0.08em' }}>
              {ref}
            </p>
            <p className="font-serif text-sm text-gray-500">
              Please save this reference number. You will need it to track your application status.
            </p>
          </div>

          {/* What happens next */}
          <div className="bg-white border border-stone-200 p-8 text-left mb-8">
            <p className="font-serif text-[11px] text-gray-400 tracking-widest uppercase mb-5">What Happens Next</p>
            {[
              { step: '01', title: 'Document Verification',  desc: 'Our team will verify the documents you submitted within 3–5 business days.' },
              { step: '02', title: 'Application Review',     desc: 'The admissions committee will review your academic background and personal statement.' },
              { step: '03', title: 'Interview (if required)', desc: 'You may be contacted for an in-person or virtual interview with faculty.' },
              { step: '04', title: 'Decision Notification',  desc: 'You will receive your admission decision by email within 4–6 weeks.' },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-stone-100 last:border-none">
                <div className="font-serif text-xl leading-none flex-shrink-0 mt-0.5"
                     style={{ color: '#C8A951' }}>{s.step}</div>
                <div>
                  <p className="font-serif text-navy-900 text-sm mb-1">{s.title}</p>
                  <p className="font-serif text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary no-underline">Back to Home</Link>
            <Link href="/#contact" className="btn-outline-navy no-underline">Contact Admissions</Link>
          </div>

          <p className="font-serif text-xs text-gray-400 mt-8">
            Questions? Email us at{' '}
            <a href="mailto:admissions@ums.edu" className="no-underline"
               style={{ color: '#C8A951' }}>admissions@ums.edu</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
