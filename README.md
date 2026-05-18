# University Management System

A production-ready, full-stack university management platform built with **Next.js 14 App Router**, **MongoDB Atlas**, and **NextAuth**.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## Features

### Public Site
- University homepage with hero, about, faculties, admissions, news, and contact sections
- 4-step admission application form with per-file drag-and-drop document uploads
- Application progress saved automatically — applicants can resume from any step
- Contact form saved to database

### Student Portal (`/dashboard`)
- Secure login with role-based access control
- Personalized overview: GPA, faculty, year, student ID
- Live university announcements feed
- Profile page

### Admin Panel (`/admin`)
- **Dashboard** — real-time pipeline stats, application status chart, activity feeds
- **Students** — search, filter, edit, activate/deactivate, delete
- **Applications** — tabbed status list, full-detail review with document viewer and status timeline
- **Faculties** — full CRUD with icon picker and program management
- **News** — draft → publish → archive workflow, featured articles
- **Announcements** — create and delete notices
- **Messages** — contact form inbox with read/replied status

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, SSR) |
| Language | TypeScript (strict) |
| Authentication | NextAuth v4 — JWT, Credentials provider |
| Database | MongoDB Atlas + Mongoose |
| Styling | Tailwind CSS |
| Validation | Zod |
| File Uploads | Native `fs` (swap for S3/Cloudinary in production) |
| Security | bcrypt (12 rounds), rate limiting, security headers |

---

## Prerequisites

- **Node.js** >= 18.17.0
- **npm** >= 9
- **MongoDB Atlas** account (free tier works perfectly)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/university-management-system.git
cd university-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (see below) |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `NEXTAUTH_SECRET` | Random 32+ char string (generate below) |

**Get your MongoDB Atlas URI:**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Database Access → Add database user
3. Network Access → Add IP `0.0.0.0/0` (for dev) or your server IP
4. Connect → Drivers → copy the connection string
5. Replace `<password>` with your user's password

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Seed the database

```bash
npm run seed
```

This creates:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ums.edu` | `Admin@1234` |
| Student | `student@ums.edu` | `Student@1234` |
| Student | `student2@ums.edu` | `Student@1234` |

Plus 6 faculties, 3 announcements, and 3 news articles.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| URL | Description |
|---|---|
| `/` | Public university site |
| `/login` | Login portal (Student / Admin tabs) |
| `/register` | Student self-registration |
| `/apply` | 4-step admission application |
| `/dashboard` | Student portal (requires login) |
| `/admin` | Admin panel (requires admin login) |
| `/api/health` | System health check |

---

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### 3. Set environment variables in Vercel

In Vercel → Project Settings → Environment Variables, add:

| Key | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Your generated 32+ char secret |

> **Important:** Set these for `Production`, `Preview`, and `Development` environments.

### 4. Redeploy

After adding env vars, trigger a new deployment (Deployments → Redeploy).

### 5. Seed production database

```bash
MONGODB_URI="your-production-uri" NODE_ENV=production npm run seed:prod
```

Or run from Vercel Functions CLI if preferred.

---

## API Reference

All endpoints return `{ success: boolean, data?: T, error?: string }`.

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | Student self-registration |
| `POST` | `/api/applications` | Save/submit application step |
| `POST` | `/api/applications/upload` | Upload application document |
| `POST` | `/api/contact` | Submit contact form |
| `GET` | `/api/admin/faculties` | List faculties |
| `GET` | `/api/admin/news` | List published news |
| `GET` | `/api/admin/announcements` | List announcements |
| `GET` | `/api/health` | System health check |

### Admin only

| Method | Endpoint | Description |
|---|---|---|
| `GET/PATCH` | `/api/applications` | List / update status |
| `GET` | `/api/applications/[id]` | Full application detail |
| `POST/PATCH/DELETE` | `/api/admin/faculties` | Faculty CRUD |
| `POST/PATCH/DELETE` | `/api/admin/news` | News CRUD |
| `GET/PATCH/DELETE` | `/api/admin/students/[id]` | Edit/delete student |
| `GET/POST` | `/api/admin/users` | List/create students |
| `GET/PATCH/DELETE` | `/api/admin/announcements` | Announcement management |
| `GET/PATCH` | `/api/contact` | Read/update contact messages |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Public homepage
│   ├── apply/                          # 4-step admission form
│   ├── login/ register/                # Auth pages
│   ├── dashboard/                      # Student portal (protected)
│   ├── admin/                          # Admin panel (role-protected)
│   └── api/                            # REST API routes
├── components/
│   ├── admin/                          # Admin UI + shared primitives
│   ├── apply/                          # Multi-step form components
│   ├── dashboard/                      # Student sidebar
│   ├── layout/                         # Navbar, Footer, SessionProvider
│   └── ui/                             # Shared UI components
├── lib/
│   ├── db.ts                           # MongoDB singleton
│   ├── auth.ts                         # Session helpers
│   ├── auth-options.ts                 # NextAuth config
│   ├── apiHandler.ts                   # Rate limiting + response helpers
│   ├── env.ts                          # Environment validation
│   ├── rateLimit.ts                    # In-memory rate limiter
│   └── upload.ts                       # File save/validate utilities
├── models/                             # Mongoose schemas
│   ├── User.ts                         # Students + admins
│   ├── Application.ts                  # Admission applications
│   ├── Faculty.ts
│   ├── News.ts
│   ├── Announcement.ts
│   └── Contact.ts
├── middleware.ts                        # Edge route protection
└── types/index.ts                      # TypeScript type extensions
scripts/
└── seed.ts                             # Database seed script
```

---

## Security

- Passwords hashed with **bcrypt** (cost factor 12)
- Sessions signed with **JWT** — stateless, 30-day expiry
- Route protection at the **Edge** via Next.js middleware
- Server-side `requireAdmin()` / `requireStudent()` guards on every protected page
- All inputs validated with **Zod** before database writes
- File uploads validated for MIME type + size on client **and** server
- Rate limiting on all API routes (configurable via env vars)
- Security headers on all responses (X-Frame-Options, HSTS, CSP, etc.)
- `X-Powered-By` header removed

---

## Important Production Notes

### File Uploads
`public/uploads/` is **ephemeral on Vercel** (each deployment resets the filesystem). For persistent file storage:

1. Create an S3 bucket or Cloudinary account
2. Replace `saveFile()` in `src/lib/upload.ts` with a cloud SDK call
3. Update `getFileUrl()` to return the cloud URL

### Rate Limiting
The in-memory rate limiter works per-instance. For multi-region Vercel deployments:
- Replace the `Map` in `src/lib/rateLimit.ts` with [Upstash Redis](https://upstash.com)
- Or use [Vercel KV](https://vercel.com/storage/kv)

---

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix ESLint issues
npm run type-check   # TypeScript type check without emitting
npm run seed         # Seed local database
npm run seed:prod    # Seed production database
```

---

## License

MIT — free to use for personal, educational, and commercial projects.
