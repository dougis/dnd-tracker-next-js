import { Session } from 'next-auth';

export type SessionUser = NonNullable<Session['user']>;

export interface NotificationPreferences {
  email: boolean;
  combat: boolean;
  encounters: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}