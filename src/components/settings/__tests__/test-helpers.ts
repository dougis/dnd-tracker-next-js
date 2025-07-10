import { SessionUser } from '@/types/auth';

export const mockUsers = {
  freeUser: {
    id: '1',
    name: 'Free User',
    email: 'free@example.com',
    subscriptionTier: 'free',
    notifications: {
      email: true,
      combat: true,
      encounters: true,
    },
  } as SessionUser,

  paidUser: {
    id: '2',
    name: 'Paid User',
    email: 'paid@example.com',
    subscriptionTier: 'seasoned',
    notifications: {
      email: true,
      combat: false,
      encounters: true,
    },
  } as SessionUser,

  premiumUser: {
    id: '3',
    name: 'Premium User',
    email: 'premium@example.com',
    subscriptionTier: 'master',
    notifications: {
      email: false,
      combat: true,
      encounters: true,
    },
  } as SessionUser,
};

export const mockSessions = {
  free: {
    user: mockUsers.freeUser,
    expires: '2024-12-31',
  },
  paid: {
    user: mockUsers.paidUser,
    expires: '2024-12-31',
  },
  premium: {
    user: mockUsers.premiumUser,
    expires: '2024-12-31',
  },
};

export const subscriptionTiers = {
  free: {
    name: 'Free Adventurer',
    price: '$0/month',
    features: ['1 party', '3 encounters', '10 creatures'],
  },
  seasoned: {
    name: 'Seasoned Adventurer',
    price: '$4.99/month',
    features: ['3 parties', '15 encounters', '50 creatures'],
  },
  expert: {
    name: 'Expert Dungeon Master',
    price: '$9.99/month',
    features: ['10 parties', '50 encounters', '200 creatures'],
  },
  master: {
    name: 'Master of Dungeons',
    price: '$19.99/month',
    features: ['25 parties', '100 encounters', '500 creatures'],
  },
  guild: {
    name: 'Guild Master',
    price: '$39.99/month',
    features: ['Unlimited parties', 'Unlimited encounters', 'Unlimited creatures', 'Organization features'],
  },
};

export const createMockFormEvent = (name: string, value: string | boolean) => ({
  target: {
    name,
    value,
    type: typeof value === 'boolean' ? 'checkbox' : 'text',
    checked: typeof value === 'boolean' ? value : undefined,
  },
});

export const waitForFormSubmission = () => new Promise(resolve => setTimeout(resolve, 0));

export const getSettingsSelectors = () => ({
  // Profile section
  nameInput: () => screen.getByLabelText(/name/i),
  emailInput: () => screen.getByLabelText(/email/i),
  saveProfileButton: () => screen.getByRole('button', { name: /save profile/i }),

  // Notifications section
  emailNotificationToggle: () => screen.getByLabelText(/email notifications/i),
  combatReminderToggle: () => screen.getByLabelText(/combat reminders/i),
  encounterUpdateToggle: () => screen.getByLabelText(/encounter updates/i),
  saveNotificationsButton: () => screen.getByRole('button', { name: /save notifications/i }),

  // Theme section
  themeToggle: () => screen.getByTestId('theme-toggle'),

  // Subscription section
  currentTier: () => screen.getByTestId('current-subscription-tier'),
  upgradeButton: () => screen.getByRole('button', { name: /upgrade plan/i }),
  subscriptionFeatures: () => screen.getByTestId('subscription-features'),

  // Security section
  changePasswordButton: () => screen.getByRole('button', { name: /change password/i }),
  deleteAccountButton: () => screen.getByRole('button', { name: /delete account/i }),

  // Loading and feedback
  loadingIndicator: () => screen.queryByText(/saving\.\.\./i),
  successMessage: () => screen.queryByText(/settings saved successfully/i),
  errorMessage: () => screen.queryByText(/failed to save settings/i),

  // Validation messages
  nameError: () => screen.queryByText(/name is required/i),
  emailError: () => screen.queryByText(/please enter a valid email/i),
});

// Import screen from testing-library in tests that use this helper
let screen: any;
try {
  screen = require('@testing-library/react').screen;
} catch {
  // Screen will be imported in test files
}

export const mockApiResponses = {
  updateUserSuccess: () => Promise.resolve({ success: true }),
  updateUserError: () => Promise.reject(new Error('API Error')),
  updateUserValidationError: () => Promise.reject(new Error('Validation failed')),
};