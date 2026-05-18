/**
 * NextAuth configuration.
 *
 * JWT strategy — stateless, no server-side session table.
 * Credentials provider with role gate + inactive-account guard.
 * Integrates with the structured logger for all auth events.
 */

import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider       from 'next-auth/providers/credentials'
import bcrypt                    from 'bcryptjs'
import { connectDB }             from './db'
import { UserModel }             from '@/models/User'
import { logger }                from './logger'
import { AUTH_CONFIG }           from '@/config/app.config'

export const authOptions: NextAuthOptions = {
  session: {
    strategy:  'jwt',
    maxAge:    AUTH_CONFIG.sessionMaxAge,
    updateAge: AUTH_CONFIG.sessionUpdate,
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
        role:     { label: 'Role',     type: 'text'     },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.auth.loginFailure('missing-credentials')
          throw new Error('Email and password are required')
        }

        const email = credentials.email.toLowerCase().trim()
        const role  = credentials.role?.trim() as 'student' | 'admin' | undefined

        await connectDB()

        const user = await UserModel
          .findOne({ email, isActive: true })
          .select('+password')   // password has select:false by default
          .lean()

        if (!user) {
          // Identical message for "no account" and "wrong password" — prevents email enumeration
          logger.auth.loginFailure('user-not-found-or-inactive', email)
          throw new Error('Invalid credentials')
        }

        // Role gate — blocks student trying admin tab (and vice versa)
        if (role && user.role !== role) {
          logger.auth.loginFailure('role-mismatch', email)
          throw new Error(`No ${role} account found with this email`)
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) {
          logger.auth.loginFailure('wrong-password', email)
          throw new Error('Invalid credentials')
        }

        logger.auth.loginSuccess(user._id.toString(), user.role)

        return {
          id:        user._id.toString(),
          name:      user.name,
          email:     user.email,
          role:      user.role,
          studentId: user.studentId,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // NextAuth's User is extended in src/types/index.ts
        const u = user as import('next-auth').User
        token.id        = u.id
        token.role      = u.role
        token.studentId = u.studentId
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id        = token.id        as string
        session.user.role      = token.role      as 'student' | 'admin'
        session.user.studentId = token.studentId as string | undefined
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug:  process.env.NODE_ENV === 'development',

  cookies: {
    sessionToken: {
      name: AUTH_CONFIG.cookieName(),
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   process.env.NODE_ENV === 'production',
      },
    },
  },
}
