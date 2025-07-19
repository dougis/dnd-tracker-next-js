import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserService } from './services/UserService';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1' && process.env.CI !== 'true') {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  // For build time or CI environment, use a placeholder URI that won't be used
  console.warn('MONGODB_URI not set, using placeholder for build/CI');
}

const client = new MongoClient(mongoUri || 'mongodb://localhost:27017/placeholder');
const clientPromise = Promise.resolve(client);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME,
  }),
  // Fix for Issue #434: NextAuth v5 requires explicit trust host configuration
  // This prevents "UntrustedHost" errors in production deployments
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
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
          const result = await UserService.getUserByEmail(
            credentials.email as string
          );
          if (!result.success) {
            return null;
          }

          // Authenticate user
          const authResult = await UserService.authenticateUser({
            email: credentials.email as string,
            password: credentials.password as string,
            rememberMe: false,
          });

          if (!authResult.success || !authResult.data) {
            return null;
          }

          // Return user object for session
          const authenticatedUser = authResult.data.user;
          return {
            id: authenticatedUser.id?.toString() || '',
            email: authenticatedUser.email,
            name: `${authenticatedUser.firstName} ${authenticatedUser.lastName}`,
            subscriptionTier: authenticatedUser.subscriptionTier,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      // Add user ID and subscription tier to session from JWT token
      if (session?.user && token) {
        session.user.id = token.sub ?? ''; // JWT 'sub' field contains user ID
        session.user.subscriptionTier = token.subscriptionTier || 'free';
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      // Add user data to JWT token when user signs in
      if (user) {
        token.subscriptionTier = (user as any).subscriptionTier || 'free';
      }
      return token;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
});
