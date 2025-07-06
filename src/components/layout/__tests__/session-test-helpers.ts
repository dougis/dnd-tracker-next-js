/**
 * Test helpers for NextAuth session mocking
 * Reduces code duplication in authentication-related tests
 */

interface MockUserData {
  id?: string;
  name?: string;
  email?: string;
}

interface MockSessionOptions {
  status: 'authenticated' | 'unauthenticated' | 'loading';
  user?: MockUserData;
  expires?: string;
}

/**
 * Creates a mock session data object for NextAuth testing
 */
export const createMockSession = (options: MockSessionOptions) => {
  const { status, user, expires = '2024-01-01' } = options;

  if (status === 'loading' || status === 'unauthenticated') {
    return {
      data: null,
      status,
      update: jest.fn(),
    };
  }

  return {
    data: {
      user: user ? { id: '1', ...user } : null,
      expires,
    },
    status,
    update: jest.fn(),
  };
};

/**
 * Common session data configurations for testing
 */
export const SESSION_CONFIGS = {
  authenticatedWithName: {
    status: 'authenticated' as const,
    user: { name: 'John Doe', email: 'john@example.com' },
  },
  authenticatedWithEmailOnly: {
    status: 'authenticated' as const,
    user: { email: 'john@example.com' },
  },
  authenticatedMinimal: {
    status: 'authenticated' as const,
    user: {},
  },
  loading: {
    status: 'loading' as const,
  },
  unauthenticated: {
    status: 'unauthenticated' as const,
  },
} as const;

/**
 * Helper to setup mock useSession with predefined configuration
 */
export const setupMockSession = (
  mockUseSession: jest.MockedFunction<any>,
  config: keyof typeof SESSION_CONFIGS
) => {
  mockUseSession.mockReturnValue(createMockSession(SESSION_CONFIGS[config]));
};

/**
 * Helper to create custom mock session data
 */
export const setupCustomMockSession = (
  mockUseSession: jest.MockedFunction<any>,
  options: MockSessionOptions
) => {
  mockUseSession.mockReturnValue(createMockSession(options));
};