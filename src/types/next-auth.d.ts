/* eslint-disable */
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      subscriptionTier: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    subscriptionTier: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    subscriptionTier: string;
  }
}
