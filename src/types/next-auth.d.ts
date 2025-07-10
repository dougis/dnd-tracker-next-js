/* eslint-disable no-unused-vars */
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import { NotificationPreferences } from './auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      subscriptionTier: string;
      notifications?: NotificationPreferences;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    subscriptionTier: string;
    notifications?: NotificationPreferences;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    subscriptionTier: string;
  }
}
/* eslint-enable no-unused-vars */