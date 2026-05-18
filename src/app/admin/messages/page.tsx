import { requireAdmin }  from '@/lib/auth'
import { connectDB }      from '@/lib/db'
import { ContactModel }   from '@/models/Contact'
import { PageHeader, StatusBadge } from '@/components/admin/ui'
import { MessagesClient } from '@/components/admin/MessagesClient'

export default async function AdminMessagesPage() {
  await requireAdmin()
  await connectDB()
  const messages = await ContactModel.find().sort({ createdAt: -1 }).lean()

  return (
    <div className="p-6 xl:p-8 max-w-5xl mx-auto">
      <PageHeader label="Communications" title="Contact Messages" />
      <MessagesClient initialMessages={JSON.parse(JSON.stringify(messages))} />
    </div>
  )
}
