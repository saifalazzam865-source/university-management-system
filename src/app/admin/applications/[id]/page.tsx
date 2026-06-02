import { requireAdmin } from '@/lib/auth'
import { connectDB }    from '@/lib/db'
import { ApplicationModel } from '@/models/Application'
import { formatDate }   from '@/lib/utils'
import { notFound }     from 'next/navigation'
import Link             from 'next/link'
import { AdminReviewPanel } from '@/components/admin/AdminReviewPanel'
import { getFileUrl, formatFileSize, getFileIcon } from '@/lib/upload-utils'

interface Props {
  params: { id: string }
}

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-50 text-blue-700',
  reviewing: 'bg-amber-50 text-amber-700',
  accepted:  'bg-emerald-50 text-emerald-700',
  rejected:  'bg-red-50 text-red-600',
}

export default async function ApplicationDetailPage({ params }: Props) {
  await requireAdmin()
  await connectDB()

  const app = await ApplicationModel.findById(params.id).lean() as any
  if (!app) notFound()

  const fullName = `${app.firstName} ${app.lastName}`

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/applications"
          className="font-serif text-xs tracking-widest no-underline mb-4 inline-block"
          style={{ color: '#C8A951' }}>← ALL APPLICATIONS</Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Application Review</p>
            <h1 className="font-serif font-normal text-navy-900 text-3xl mb-1">{fullName}</h1>
            <div className="flex items-center gap-3">
              <code className="font-mono text-sm text-gray-500 bg-stone-100 px-2 py-0.5">
                {app.applicationRef}
              </code>
              <span className={`badge ${STATUS_COLORS[app.status] || 'badge-general'} capitalize`}>
                {app.status}
              </span>
            </div>
          </div>

          {/* Review controls */}
          <AdminReviewPanel id={app._id.toString()} currentStatus={app.status} reviewNote={app.reviewNote || ''} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left — applicant details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info */}
          <Section title="Personal Information">
            <Grid rows={[
              { label: 'Full Name',    value: fullName },
              { label: 'Email',        value: app.email },
              { label: 'Phone',        value: app.phone },
              { label: 'Date of Birth',value: app.dateOfBirth },
              { label: 'Nationality',  value: app.nationality },
              { label: 'Gender',       value: app.gender },
              { label: 'Address',      value: app.address },
            ]} />
          </Section>

          {/* Academic info */}
          <Section title="Academic Background">
            <Grid rows={[
              { label: 'Faculty',         value: app.faculty },
              { label: 'Program',         value: app.program },
              { label: 'Specialization',  value: app.specialization },
              { label: 'Previous School', value: app.previousSchool },
              { label: 'Graduation Year', value: app.graduationYear?.toString() },
              { label: 'GPA',             value: app.gpa != null ? `${Number(app.gpa).toFixed(2)} / 4.0` : undefined },
              { label: 'English Level',   value: app.englishLevel },
            ]} />
            {app.personalStatement && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="font-serif text-[11px] text-gray-400 tracking-widest uppercase mb-2">Personal Statement</p>
                <p className="font-serif text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {app.personalStatement}
                </p>
              </div>
            )}
          </Section>

          {/* Documents */}
          <Section title={`Documents (${app.documents?.length || 0} uploaded)`}>
            {!app.documents?.length ? (
              <p className="font-serif text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {app.documents.map((doc: any, i: number) => (
                  <a key={i} href={getFileUrl(doc.storedName)} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-4 p-4 border border-stone-200 hover:border-navy-900
                                hover:bg-stone-50 transition-all no-underline group">
                    <span className="text-2xl flex-shrink-0">{getFileIcon(doc.mimeType)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm text-navy-900 group-hover:underline">{doc.label}</p>
                      <p className="font-serif text-xs text-gray-400 truncate">
                        {doc.originalName} · {formatFileSize(doc.sizeBytes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-serif text-xs text-gray-400">
                        {doc.uploadedAt ? formatDate(doc.uploadedAt) : ''}
                      </span>
                      <span className="font-serif text-xs text-gold-500 group-hover:text-navy-900 transition-colors">
                        View →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right — sidebar with metadata and timeline */}
        <div className="space-y-5">

          {/* Quick stats */}
          <Section title="Application Details">
            <div className="space-y-3">
              {[
                { label: 'Submitted',      value: app.submittedAt ? formatDate(app.submittedAt) : 'Not submitted' },
                { label: 'Last Updated',   value: formatDate(app.updatedAt) },
                { label: 'Reviewed By',    value: app.reviewedBy || '—' },
                { label: 'Documents',      value: `${app.documents?.length || 0} files uploaded` },
              ].map((r, i) => (
                <div key={i} className="flex flex-col gap-0.5 py-2.5 border-b border-stone-100 last:border-none">
                  <span className="font-serif text-[10px] text-gray-400 tracking-widest uppercase">{r.label}</span>
                  <span className="font-serif text-sm text-gray-700">{r.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Review note */}
          {app.reviewNote && (
            <Section title="Review Note">
              <p className="font-serif text-sm text-gray-700 leading-relaxed">{app.reviewNote}</p>
            </Section>
          )}

          {/* Timeline */}
          {app.timeline?.length > 0 && (
            <Section title="Status Timeline">
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-stone-200" />
                <div className="space-y-4">
                  {[...app.timeline].reverse().map((ev: any, i: number) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-[10px]"
                           style={{ background: '#0F2356', color: '#C8A951' }}>●</div>
                      <div className="pb-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`badge text-[10px] capitalize ${STATUS_COLORS[ev.status] || 'badge-general'}`}>
                            {ev.status}
                          </span>
                        </div>
                        {ev.note && (
                          <p className="font-serif text-xs text-gray-500 mt-0.5">{ev.note}</p>
                        )}
                        <p className="font-serif text-[10px] text-gray-400 mt-1">
                          {ev.changedBy} · {ev.changedAt ? formatDate(ev.changedAt) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Small helper components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200">
      <div className="px-5 py-3 border-b border-stone-200" style={{ background: '#0F2356' }}>
        <span className="font-serif text-white text-sm tracking-wide">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Grid({ rows }: { rows: { label: string; value?: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      {rows.filter(r => r.value).map((r, i) => (
        <div key={i} className="py-2.5 border-b border-stone-100">
          <span className="font-serif text-[10px] text-gray-400 tracking-widest uppercase block mb-0.5">
            {r.label}
          </span>
          <span className="font-serif text-sm text-gray-700">{r.value}</span>
        </div>
      ))}
    </div>
  )
}
