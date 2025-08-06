import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import EmailProvider from 'next-auth/providers/email';
import { createTransport } from 'nodemailer';
import { env } from '@/config/env';

// Email transport configuration
const transport = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: SupabaseAdapter({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    secret: env.NEXTAUTH_SECRET,
  }),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await transport.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'Sign in to Stake for Shame',
          text: `Sign in to Stake for Shame\n\nUse the link below to sign in:\n${url}\n\n`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Welcome to Stake for Shame</h1>
              <p>Click the button below to sign in to your account:</p>
              <a href="${url}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; 
                        text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">
                Sign in to Stake for Shame
              </a>
              <p>Or copy and paste this URL into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${url}</p>
              <p style="color: #6b7280; font-size: 0.875rem; margin-top: 2rem;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
