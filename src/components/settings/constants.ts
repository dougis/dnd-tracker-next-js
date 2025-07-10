export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free Adventurer',
    price: '$0',
    period: 'month',
    features: [
      '1 party',
      '3 encounters',
      '10 creatures',
      'Basic combat tracking',
      'Character management',
    ],
    limits: {
      parties: 1,
      encounters: 3,
      creatures: 10,
    },
  },
  seasoned: {
    id: 'seasoned',
    name: 'Seasoned Adventurer',
    price: '$4.99',
    period: 'month',
    features: [
      '3 parties',
      '15 encounters',
      '50 creatures',
      'Advanced combat features',
      'Encounter templates',
      'Basic sharing',
    ],
    limits: {
      parties: 3,
      encounters: 15,
      creatures: 50,
    },
  },
  expert: {
    id: 'expert',
    name: 'Expert Dungeon Master',
    price: '$9.99',
    period: 'month',
    features: [
      '10 parties',
      '50 encounters',
      '200 creatures',
      'Lair actions support',
      'Advanced sharing',
      'Export/import features',
      'Priority support',
    ],
    limits: {
      parties: 10,
      encounters: 50,
      creatures: 200,
    },
  },
  master: {
    id: 'master',
    name: 'Master of Dungeons',
    price: '$19.99',
    period: 'month',
    features: [
      '25 parties',
      '100 encounters',
      '500 creatures',
      'All expert features',
      'Campaign management',
      'Advanced analytics',
      'Custom themes',
    ],
    limits: {
      parties: 25,
      encounters: 100,
      creatures: 500,
    },
  },
  guild: {
    id: 'guild',
    name: 'Guild Master',
    price: '$39.99',
    period: 'month',
    features: [
      'Unlimited parties',
      'Unlimited encounters',
      'Unlimited creatures',
      'All premium features',
      'Organization management',
      'Team collaboration',
      'White-label options',
      'Dedicated support',
    ],
    limits: {
      parties: Infinity,
      encounters: Infinity,
      creatures: Infinity,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  email: true,
  combat: true,
  encounters: true,
  weeklyDigest: false,
  productUpdates: true,
  securityAlerts: true,
};

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

export const SETTINGS_SECTIONS = {
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  THEME: 'theme',
  SUBSCRIPTION: 'subscription',
  SECURITY: 'security',
} as const;

export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;