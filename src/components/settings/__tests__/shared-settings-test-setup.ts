import { useSession, signOut } from 'next-auth/react';

/**
 * Shared Settings Test Setup
 * 
 * This module consolidates common mock setups and utilities used across
 * settings component tests to eliminate code duplication.
 */

// ============================================================================
// MOCK FUNCTIONS
// ============================================================================

export const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
export const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
export const mockFetch = jest.fn();

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Sets up all standard mocks for Settings component tests
 */
export function setupSettingsTestMocks() {
  // Mock next-auth
  jest.mock('next-auth/react');
  
  // Mock global fetch for API calls
  global.fetch = mockFetch;

  // Mock theme components
  jest.mock('@/components/theme-toggle', () => ({
    ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
  }));

  // Mock the settings form hook with standard return values
  jest.mock('../hooks/useSettingsForm', () => ({
    useSettingsForm: () => ({
      profileData: { name: 'Test User', email: 'test@example.com' },
      setProfileData: jest.fn(),
      notifications: { email: true, combat: true, encounters: true },
      handleNotificationChange: jest.fn(),
      formErrors: {},
      message: null,
      isLoadingProfile: false,
      isLoadingNotifications: false,
      handleProfileSubmit: jest.fn(),
      handleNotificationsSubmit: jest.fn(),
    }),
  }));
}

/**
 * Standard beforeEach setup for Settings tests
 */
export function setupSettingsBeforeEach(sessionData?: any) {
  jest.clearAllMocks();
  
  const defaultSession = {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      subscriptionTier: 'free',
    },
    expires: '2024-12-31',
  };

  mockUseSession.mockReturnValue({
    data: sessionData || defaultSession,
    status: 'authenticated',
    update: jest.fn(),
  });
}

// ============================================================================
// API MOCK HELPERS
// ============================================================================

/**
 * Mock a successful API response
 */
export function mockApiSuccess(responseData?: any) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: true,
      ...responseData,
    }),
  });
}

/**
 * Mock a failed API response
 */
export function mockApiError(message: string = 'API Error', statusCode: number = 500) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({
      success: false,
      message,
    }),
    status: statusCode,
  });
}

/**
 * Mock a network error
 */
export function mockNetworkError(errorMessage: string = 'Network error') {
  mockFetch.mockRejectedValueOnce(new Error(errorMessage));
}

/**
 * Mock account deletion API response
 */
export function mockDeleteAccountResponse(success: boolean, message: string = '') {
  mockFetch.mockResolvedValueOnce({
    ok: success,
    json: async () => ({
      success,
      message: success ? 'Account deleted successfully' : message || 'Failed to delete account',
    }),
  });
}

/**
 * Mock a delayed API response for testing loading states
 */
export function mockApiDelay(delay: number = 100) {
  mockFetch.mockImplementation(() => 
    new Promise(resolve => setTimeout(resolve, delay))
  );
}