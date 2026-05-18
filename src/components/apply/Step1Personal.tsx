'use client'

export interface Step1Data {
  firstName:   string
  lastName:    string
  email:       string
  phone:       string
  dateOfBirth: string
  nationality: string
  address:     string
  gender:      string
}

interface Props {
  data:     Step1Data
  onChange: (k: keyof Step1Data, v: string) => void
}

export function Step1Personal({ data, onChange }: Props) {
  const f = (k: keyof Step1Data) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => onChange(k, e.target.value)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">First Name *</label>
          <input required className="form-input" value={data.firstName}
            onChange={f('firstName')} placeholder="Jane" />
        </div>
        <div>
          <label className="form-label">Last Name *</label>
          <input required className="form-input" value={data.lastName}
            onChange={f('lastName')} placeholder="Smith" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Email Address *</label>
          <input required type="email" className="form-input" value={data.email}
            onChange={f('email')} placeholder="jane@example.com" />
        </div>
        <div>
          <label className="form-label">Phone Number *</label>
          <input required className="form-input" value={data.phone}
            onChange={f('phone')} placeholder="+962 7x xxx xxxx" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Date of Birth</label>
          <input type="date" className="form-input" value={data.dateOfBirth}
            onChange={f('dateOfBirth')} />
        </div>
        <div>
          <label className="form-label">Gender</label>
          <select className="form-input" value={data.gender} onChange={f('gender')}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Nationality</label>
        <input className="form-input" value={data.nationality}
          onChange={f('nationality')} placeholder="e.g. Jordanian" />
      </div>

      <div>
        <label className="form-label">Current Address</label>
        <textarea className="form-input resize-none" rows={2} value={data.address}
          onChange={f('address')} placeholder="Street, City, Country" />
      </div>
    </div>
  )
}
