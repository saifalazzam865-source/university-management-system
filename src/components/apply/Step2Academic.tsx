'use client'

export interface Step2Data {
  faculty:           string
  program:           string
  specialization:    string
  previousSchool:    string
  graduationYear:    string
  gpa:               string
  englishLevel:      string
  personalStatement: string
}

interface Props {
  data:     Step2Data
  onChange: (k: keyof Step2Data, v: string) => void
}

const FACULTIES = [
  'Science & Technology',
  'Law & Political Science',
  'Medicine & Health',
  'Engineering',
  'Arts & Humanities',
  'Business & Economics',
]

const YEARS = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString())

export function Step2Academic({ data, onChange }: Props) {
  const f = (k: keyof Step2Data) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => onChange(k, e.target.value)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Faculty *</label>
          <select required className="form-input" value={data.faculty} onChange={f('faculty')}>
            <option value="">Select faculty…</option>
            {FACULTIES.map(fac => <option key={fac}>{fac}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Program *</label>
          <select required className="form-input" value={data.program} onChange={f('program')}>
            <option value="">Select program…</option>
            <option value="undergraduate">Undergraduate (Bachelor's)</option>
            <option value="postgraduate">Postgraduate (Master's / PhD)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Specialization / Major</label>
        <input className="form-input" value={data.specialization}
          onChange={f('specialization')} placeholder="e.g. Computer Science, Civil Engineering" />
      </div>

      <div>
        <label className="form-label">Previous School / University *</label>
        <input required className="form-input" value={data.previousSchool}
          onChange={f('previousSchool')} placeholder="School or university name" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Graduation Year</label>
          <select className="form-input" value={data.graduationYear} onChange={f('graduationYear')}>
            <option value="">Select…</option>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">GPA (out of 4.0)</label>
          <input type="number" step="0.01" min="0" max="4" className="form-input"
            value={data.gpa} onChange={f('gpa')} placeholder="e.g. 3.50" />
        </div>
        <div>
          <label className="form-label">English Level</label>
          <select className="form-input" value={data.englishLevel} onChange={f('englishLevel')}>
            <option value="">Select…</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="native">Native</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Personal Statement</label>
        <textarea className="form-input resize-y" rows={6} value={data.personalStatement}
          onChange={f('personalStatement')}
          placeholder="Tell us about yourself, your goals, and why you want to join University Management System…" />
        <p className="font-serif text-xs text-gray-400 mt-1">
          {data.personalStatement.length} / 1000 characters recommended
        </p>
      </div>
    </div>
  )
}
