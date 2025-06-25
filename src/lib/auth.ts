import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { UserService } from './services/UserService';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = Promise.resolve(client);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME,
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user by email
          const result = await UserService.getUserByEmail(credentials.email);
          
          if (!result.success) {
            return null;
          }
          
          const user = result.data;
          if (!user) {
            return null;
          }

          // Instead of direct password verification, use the UserService authenticate method
          const authResult = await UserService.authenticateUser({
            email: credentials.email,
            password: credentials.password
          });
          
          if (!authResult.success) {
            return null;
          }

          // Return user object for session
          const authenticatedUser = authResult.data.user;
          return {
            id: authenticatedUser._id.toString(),
            email: authenticatedUser.email,
            name: authenticatedUser.firstName + ' ' + authenticatedUser.lastName,
            subscriptionTier: user.subscriptionTier,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      // Add user ID and subscription tier to session
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.subscriptionTier =
          (user as any).subscriptionTier || 'free';
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      // Add user data to JWT token
      if (user) {
        token.subscriptionTier = (user as any).subscriptionTier || 'free';
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
});
