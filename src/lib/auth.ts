/**
 * NextAuth configuration — two credential paths:
 *   1. phone + password   (staff, admin, returning customers)
 *   2. phone + OTP        (primary consumer flow in India)
 *
 * Role is embedded in the JWT so the admin layout can gate without a DB hit
 * on every request.
 */
import type { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { redis, rateLimit } from '@/lib/db/redis';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: string; phone: string } & DefaultSession['user'];
  }
  interface User {
    id: string;
    role: string;
    phone: string;
  }
}

const OTP_TTL = 300; // 5 minutes

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login', error: '/login' },

  providers: [
    /* ── Password login ── */
    CredentialsProvider({
      id: 'password',
      name: 'Phone & Password',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.password) return null;

        const allowed = await rateLimit(`login:${credentials.phone}`, 5, 900);
        if (!allowed) throw new Error('Too many attempts. Try again in 15 minutes.');

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });
        if (!user?.passwordHash || user.deletedAt) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.fullName,
          email: user.email ?? undefined,
          phone: user.phone,
          role: user.role,
        };
      },
    }),

    /* ── OTP login ── */
    CredentialsProvider({
      id: 'otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.otp) return null;

        const allowed = await rateLimit(`otp-verify:${credentials.phone}`, 5, 900);
        if (!allowed) throw new Error('Too many attempts. Please request a new OTP.');

        const stored = await redis?.get(`otp:${credentials.phone}`);
        if (!stored || stored !== credentials.otp) return null;
        await redis?.del(`otp:${credentials.phone}`);

        // First OTP login auto-creates the account
        const user = await prisma.user.upsert({
          where: { phone: credentials.phone },
          update: { lastLoginAt: new Date(), phoneVerifiedAt: new Date() },
          create: {
            phone: credentials.phone,
            fullName: `Customer ${credentials.phone.slice(-4)}`,
            role: 'CUSTOMER',
            phoneVerifiedAt: new Date(),
            lastLoginAt: new Date(),
            acquisitionSource: 'otp_login',
          },
        });

        return {
          id: user.id,
          name: user.fullName,
          email: user.email ?? undefined,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      // Re-read role on explicit session update (e.g. promotion to STAFF)
      if (trigger === 'update' && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (fresh) token.role = fresh.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/* ── OTP issuance (called by /api/auth/send-otp) ─────────────────────────── */

export async function issueOtp(phone: string): Promise<{ ok: boolean; message: string }> {
  const allowed = await rateLimit(`otp-send:${phone}`, 3, 600);
  if (!allowed) return { ok: false, message: 'Too many OTP requests. Wait 10 minutes.' };

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await redis?.setex(`otp:${phone}`, OTP_TTL, otp);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[otp] ${phone} → ${otp}`);
    return { ok: true, message: 'OTP sent (check server logs in dev)' };
  }

  // MSG91 transactional SMS
  await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      authkey: process.env.MSG91_AUTH_KEY ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      recipients: [{ mobiles: `91${phone}`, OTP: otp }],
    }),
  }).catch((e) => console.error('[otp] sms failed', e));

  return { ok: true, message: 'OTP sent to your mobile' };
}

/* ── Server-side guards ──────────────────────────────────────────────────── */

export const ADMIN_ROLES = ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const;
export const isAdmin = (role?: string) => !!role && ADMIN_ROLES.includes(role as never);
export const canManageCatalog = (role?: string) => role === 'ADMIN' || role === 'SUPER_ADMIN';
export const isSuperAdmin = (role?: string) => role === 'SUPER_ADMIN';
