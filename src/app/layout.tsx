import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider }  from '@/components/layout/SessionProvider'
import { ToastContainer }   from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: {
    default:  'University Management System',
    template: '%s | University Management System',
  },
  description:
    'A full-stack university management platform covering student admissions, faculty management, content publishing, and role-based administration.',
  keywords: 'university, management system, admissions, students, faculties, education',
  openGraph: {
    title:       'University Management System',
    description: 'Full-stack university management platform.',
    type:        'website',
  },
  // Prevent search engines from indexing admin/dashboard pages
  robots: {
    index:  true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream font-serif antialiased">
        <SessionProvider>
          {children}
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  )
}
