import { requireAdmin } from '@/lib/auth'
import { connectDB }    from '@/lib/db'
import { NewsModel }    from '@/models/News'
import { formatDate }   from '@/lib/utils'
import { PageHeader, StatusBadge, EmptyState } from '@/components/admin/ui'
import { NewsClient } from '@/components/admin/NewsClient'

export default async function NewsPage() {
  await requireAdmin()
  await connectDB()
  const articles = await NewsModel.find().sort({ createdAt: -1 }).lean()

  return (
    <div className="p-6 xl:p-8 max-w-6xl mx-auto">
      <PageHeader label="Content" title="News & Articles" />
      <NewsClient initialArticles={JSON.parse(JSON.stringify(articles))} />
    </div>
  )
}
