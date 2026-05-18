'use client'

interface Step {
  number: number
  label:  string
  icon:   string
}

const STEPS: Step[] = [
  { number: 1, label: 'Personal Info',   icon: '👤' },
  { number: 2, label: 'Academic Info',   icon: '🎓' },
  { number: 3, label: 'Documents',       icon: '📎' },
  { number: 4, label: 'Review',          icon: '✓'  },
]

interface Props {
  current: number   // 1-indexed
}

export function StepIndicator({ current }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done   = step.number < current
          const active = step.number === current
          const future = step.number > current

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 flex items-center justify-center text-sm font-serif transition-all
                  ${done   ? 'text-white'                                         : ''}
                  ${active ? 'text-white shadow-lg'                               : ''}
                  ${future ? 'bg-stone-100 text-gray-400 border border-stone-200' : ''}`}
                  style={done   ? { background: '#C8A951' }
                       : active ? { background: '#0F2356' }
                       : undefined}>
                  {done ? '✓' : step.icon}
                </div>
                <span className={`mt-2 font-serif text-[11px] tracking-wide hidden sm:block
                  ${active ? 'text-navy-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 sm:mb-0 transition-all
                  ${step.number < current ? 'bg-gold-400' : 'bg-stone-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
