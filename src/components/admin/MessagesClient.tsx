'use client'
import { useState } from 'react'
import { StatusBadge } from './ui'

interface Message {
  _id:       string
  name:      string
  email:     string
  subject:   string
  message:   string
  status:    'new' | 'read' | 'replied'
  createdAt: string
}

export function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)

  const updateStatus = async (id: string, status: string) => {
    const res  = await fetch('/api/contact', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status }),
    })
    const data = await res.json()
    if (data.success) {
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: status as any } : m))
      if (selected?._id === id) setSelected(s => s ? { ...s, status: status as any } : s)
    }
  }

  const statusColor: Record<string, string> = {
    new:     'badge-urgent',
    read:    'badge-general',
    replied: 'badge-accepted',
  }

  const counts = {
    new:     messages.filter(m => m.status === 'new').length,
    read:    messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  }

  return (
    <div className="grid md:grid-cols-5 gap-6">
      {/* Message list */}
      <div className="md:col-span-2 bg-white border border-stone-200">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3" style={{ background: '#0F2356' }}>
          <span className="font-serif text-white text-sm">Inbox</span>
          {counts.new > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 font-bold" style={{ background: '#C8A951', color: '#0F2356' }}>
              {counts.new} new
            </span>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-serif text-sm text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50 max-h-[600px] overflow-y-auto">
            {messages.map(m => (
              <div
                key={m._id}
                onClick={() => { setSelected(m); if (m.status === 'new') updateStatus(m._id, 'read') }}
                className={`px-4 py-3.5 cursor-pointer transition-colors group ${
                  selected?._id === m._id ? 'bg-stone-100' : 'hover:bg-stone-50'
                } ${m.status === 'new' ? 'border-l-2' : ''}`}
                style={m.status === 'new' ? { borderLeftColor: '#C8A951' } : {}}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`font-serif text-sm truncate ${m.status === 'new' ? 'text-navy-900 font-bold' : 'text-gray-700'}`}>
                    {m.name}
                  </p>
                  <StatusBadge value={m.status} />
                </div>
                <p className="font-serif text-xs text-gray-400 truncate">{m.subject}</p>
                <p className="font-serif text-[10px] text-gray-300 mt-1">
                  {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message detail */}
      <div className="md:col-span-3 bg-white border border-stone-200">
        {!selected ? (
          <div className="py-24 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-serif text-sm text-gray-400">Select a message to read it</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-stone-100" style={{ background: '#0F2356' }}>
              <h3 className="font-serif text-white font-normal">{selected.subject}</h3>
              <p className="font-serif text-[11px]" style={{ color: 'rgba(200,169,81,0.8)' }}>
                From {selected.name} · {selected.email}
              </p>
            </div>
            <div className="p-5">
              <p className="font-serif text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                {selected.message}
              </p>
              <div className="border-t border-stone-100 pt-4 flex gap-3">
                {selected.status !== 'replied' && (
                  <button
                    onClick={() => updateStatus(selected._id, 'replied')}
                    className="font-serif text-xs px-4 py-2 text-white cursor-pointer"
                    style={{ background: '#0F2356' }}
                  >
                    Mark as Replied
                  </button>
                )}
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="font-serif text-xs px-4 py-2 border border-stone-200 text-gray-600
                             hover:bg-stone-50 transition-colors no-underline"
                >
                  Open in Email →
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary */}
      <div className="md:col-span-5 flex gap-4 flex-wrap">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-white border border-stone-200 px-4 py-2 flex items-center gap-2">
            <span className="font-serif text-navy-900">{v}</span>
            <span className="font-serif text-xs text-gray-400 capitalize">{k}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
