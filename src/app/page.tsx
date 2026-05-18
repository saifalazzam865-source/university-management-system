import Link from 'next/link'
import { Navbar }             from '@/components/layout/Navbar'
import { Footer }             from '@/components/layout/Footer'
import { ContactFormClient }  from '@/components/ui/ContactFormClient'
import { connectDB }          from '@/lib/db'
import { AnnouncementModel }  from '@/models/Announcement'
import { formatDate }         from '@/lib/utils'

const STATS = [
  { value: '1967',    label: 'Founded'            },
  { value: '24,000+', label: 'Students'            },
  { value: '180+',    label: 'Programs'            },
  { value: '95%',     label: 'Graduate Employment' },
]

const FACULTIES = [
  { icon: '⚗️', name: 'Science & Technology',   desc: 'Physics, Chemistry, Biology, Computer Science, and Engineering disciplines.' },
  { icon: '⚖️', name: 'Law & Political Science', desc: 'Constitutional law, international relations, and political theory.' },
  { icon: '🏥', name: 'Medicine & Health',       desc: 'Medicine, Pharmacy, Nursing, and Biomedical Sciences.' },
  { icon: '📐', name: 'Engineering',             desc: 'Civil, Mechanical, Electrical, and Software Engineering programs.' },
  { icon: '📚', name: 'Arts & Humanities',       desc: 'Literature, Philosophy, History, Linguistics, and Fine Arts.' },
  { icon: '📊', name: 'Business & Economics',    desc: 'Finance, Marketing, Management, Accounting, and Economics.' },
]

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'badge-academic',
  general:  'badge-general',
  event:    'badge-event',
  urgent:   'badge-urgent',
}

const STATIC_NEWS = [
  { tag: 'Research', date: 'May 12, 2026', title: 'University Secures Major Grant for AI Research Initiative',   desc: 'Our CS faculty has been awarded a landmark grant to advance AI research over the next five years.' },
  { tag: 'Campus',   date: 'May 8, 2026',  title: 'New Library Wing Opens to Students This Semester',            desc: 'The addition features 400 study spaces, collaborative labs, and a 24/7 digital resource center.' },
  { tag: 'Awards',   date: 'Apr 29, 2026', title: 'Three Faculty Members Honored with National Teaching Awards', desc: 'Professors from Medicine, Law, and Engineering recognized for excellence in teaching.' },
]

async function getLatestAnnouncements() {
  try {
    await connectDB()
    return AnnouncementModel.find().sort({ createdAt: -1 }).limit(3).lean()
  } catch {
    return []
  }
}

export default async function HomePage() {
  const announcements = await getLatestAnnouncements()

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section id="home" className="pt-16">
        <div className="min-h-[92vh] flex items-center relative overflow-hidden"
             style={{ background: '#0F2356' }}>
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(200,169,81,0.1) 0%, transparent 60%)' }} />
          <div className="max-w-6xl mx-auto px-6 py-24 w-full">
            <div className="max-w-2xl">
              <p className="section-label opacity-90">Est. 1967 · Excellence in Education</p>
              <h1 className="font-serif font-normal text-white leading-tight mb-7"
                  style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
                Shaping Minds.<br />
                <span style={{ color: '#C8A951' }}>Building Futures.</span>
              </h1>
              <p className="font-serif text-white/70 leading-relaxed mb-12 max-w-xl"
                 style={{ fontSize: 'clamp(16px, 2vw, 19px)' }}>
                University Management System has been at the forefront of academic excellence for over five decades,
                nurturing generations of leaders, innovators, and scholars.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn-primary no-underline text-center">Explore Admissions</Link>
                <Link href="#about"    className="btn-outline-white no-underline text-center">Learn More</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {STATS.map((s, i) => (
                <div key={i} className={`py-8 px-6 text-center ${i < 3 ? 'border-r border-stone-200' : ''}`}>
                  <div className="font-serif text-navy-900 leading-none mb-1.5"
                       style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>{s.value}</div>
                  <div className="text-xs text-gray-500 tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <p className="section-label">About Us</p>
              <h2 className="section-title">A Legacy of Academic Excellence</h2>
              <div className="gold-divider" />
              <p className="text-gray-600 leading-loose mb-5 font-serif">
                Founded in 1967, University Management System stands as one of the region's most respected institutions of
                higher learning. Our commitment to rigorous scholarship, ethical leadership, and community service
                has defined our character across generations.
              </p>
              <p className="text-gray-600 leading-loose mb-8 font-serif">
                With six distinguished faculties, internationally recognized research centers, and a vibrant campus
                life, the university offers an unparalleled environment for intellectual growth and personal development.
              </p>
              <Link href="#faculties" className="btn-primary no-underline">Explore Our Faculties</Link>
            </div>
            <div>
              <div className="relative p-12" style={{ background: '#0F2356' }}>
                <div className="absolute top-[-16px] right-[-16px] w-40 h-40 border-2 opacity-30"
                     style={{ borderColor: '#C8A951' }} />
                <div className="font-serif text-5xl mb-4" style={{ color: '#C8A951' }}>❝</div>
                <p className="text-white/85 font-serif italic leading-loose mb-7 text-lg">
                  Education is not the filling of a pail, but the lighting of a fire. At our university, we kindle that
                  fire in every student who walks through our doors.
                </p>
                <div className="border-t pt-5" style={{ borderColor: 'rgba(200,169,81,0.3)' }}>
                  <div className="text-white font-serif">Prof. Amira Hassan</div>
                  <div className="font-serif text-sm tracking-wide" style={{ color: '#C8A951' }}>
                    President, University Management System
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FACULTIES */}
      <section id="faculties" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label">Academic Programs</p>
            <h2 className="section-title">Our Faculties & Departments</h2>
            <div className="gold-divider mx-auto" />
            <p className="text-gray-500 max-w-xl mx-auto font-serif leading-relaxed">
              Six world-class faculties spanning science, humanities, law, medicine, and business —
              each with dedicated research centers and industry partnerships.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y border border-stone-200">
            {FACULTIES.map((f, i) => (
              <div key={i} className="p-7 bg-white hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className="w-8 h-0.5 mb-4" style={{ background: '#C8A951' }} />
                <h3 className="font-serif text-navy-900 text-lg mb-3 font-normal">{f.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-serif">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADMISSIONS */}
      <section id="admissions" className="py-24" style={{ background: '#0F2356' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-start">
            <div>
              <p className="section-label opacity-90">Join Us</p>
              <h2 className="font-serif font-normal text-white leading-tight mb-5"
                  style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
                Admissions & Applications
              </h2>
              <div className="gold-divider" />
              <p className="text-white/70 leading-loose mb-10 font-serif">
                We welcome talented students from diverse backgrounds. Our admissions process is holistic —
                we consider academic achievement, personal potential, and passion for learning.
              </p>
              {[
                { label: 'Undergraduate Applications', date: 'Open January – April 30' },
                { label: 'Postgraduate Applications',  date: 'Open Year-Round'         },
                { label: 'International Students',     date: 'Rolling Admissions'       },
                { label: 'Scholarship Applications',   date: 'Deadline: March 15'       },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b"
                     style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-white font-serif">{item.label}</span>
                  <span className="font-serif text-sm" style={{ color: '#C8A951' }}>{item.date}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {[
                { step: '01', title: 'Submit Application', desc: 'Complete the online application form with required academic documents and personal statement.' },
                { step: '02', title: 'Document Review',    desc: 'Our admissions committee reviews your application, transcripts, and supporting materials.' },
                { step: '03', title: 'Interview',          desc: 'Selected applicants may be invited for an in-person or virtual interview with faculty.' },
                { step: '04', title: 'Receive Decision',   desc: 'Admission decisions are communicated within 4–6 weeks of a complete application.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-5 p-6 border"
                     style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="font-serif text-2xl leading-none min-w-[40px]"
                       style={{ color: '#C8A951' }}>{s.step}</div>
                  <div>
                    <div className="text-white font-serif mb-1.5">{s.title}</div>
                    <div className="text-white/55 text-sm font-serif leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
              <Link href="/register" className="btn-primary no-underline text-center mt-2">
                Start Your Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section id="news" className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="section-label">Latest Updates</p>
            <h2 className="section-title mb-0">University News</h2>
            <div className="gold-divider mb-0" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(announcements.length > 0 ? (announcements as any[]) : STATIC_NEWS).map((item: any, i: number) => (
              <div key={i} className="card">
                <div className="flex justify-between items-center mb-4">
                  <span className={`badge ${
                    item.category ? (CATEGORY_COLORS[item.category] || 'badge-general') : 'badge-general'
                  }`}>
                    {item.category || item.tag}
                  </span>
                  <span className="text-xs text-gray-400 font-serif">
                    {item.createdAt ? formatDate(item.createdAt) : item.date}
                  </span>
                </div>
                <div className="w-8 h-0.5 mb-4" style={{ background: '#C8A951' }} />
                <h3 className="font-serif text-navy-900 text-lg font-normal leading-snug mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 font-serif leading-relaxed">{item.content || item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label">Get in Touch</p>
            <h2 className="section-title">Contact Us</h2>
            <div className="gold-divider mx-auto" />
            <p className="text-gray-500 max-w-md mx-auto font-serif leading-relaxed">
              Have questions about admissions, programs, or campus life? Our team is here to help.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              {[
                { icon: '📍', label: 'Address',      value: '12 University Boulevard, Academic City, Jordan 21110' },
                { icon: '📞', label: 'Phone',        value: '+962 2 720 0600' },
                { icon: '✉️', label: 'Email',        value: 'admissions@ums.edu' },
                { icon: '🕐', label: 'Office Hours', value: 'Sun–Thu, 8:00 AM – 4:00 PM' },
              ].map((c, i) => (
                <div key={i} className={`flex gap-4 py-6 ${i < 3 ? 'border-b border-stone-200' : ''}`}>
                  <div className="text-xl min-w-8 pt-0.5">{c.icon}</div>
                  <div>
                    <div className="text-[11px] tracking-widest font-serif mb-1" style={{ color: '#C8A951' }}>
                      {c.label.toUpperCase()}
                    </div>
                    <div className="font-serif text-gray-700 leading-relaxed">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <ContactFormClient />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
