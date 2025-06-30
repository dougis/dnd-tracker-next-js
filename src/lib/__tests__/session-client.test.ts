import { useSession } from 'next-auth/react';
import { renderHook } from '@testing-library/react';
import {
  useSessionGuard,
  useRequireAuth,
  useAuthState,
  RedirectConfig,
  ClientSessionUtils,
  performLogout,
} from '../session-client';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe('Client-side Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAuthState', () => {
    it('should return authenticated state for valid session', () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        expires: '2024-12-31',
      };
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current).toEqual({
        session: mockSession,
        user: mockSession.user,
        isAuthenticated: true,
        isLoading: false,
        status: 'authenticated',
      });
    });

    it('should return loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current).toEqual({
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: true,
        status: 'loading',
      });
    });

    it('should return unauthenticated state for no session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current).toEqual({
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        status: 'unauthenticated',
      });
    });
  });

  describe('useSessionGuard', () => {
    const defaultConfig: RedirectConfig = {
      redirectTo: '/auth/signin',
      replace: false,
    };

    it('should not redirect when user is authenticated', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '123' }, expires: '2024-12-31' },
        status: 'authenticated',
        update: jest.fn(),
      });

      renderHook(() => useSessionGuard(defaultConfig));

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should redirect when user is unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      renderHook(() => useSessionGuard(defaultConfig));

      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });

    it('should use replace navigation when configured', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const config: RedirectConfig = {
        redirectTo: '/auth/signin',
        replace: true,
      };

      renderHook(() => useSessionGuard(config));

      expect(mockReplace).toHaveBeenCalledWith('/auth/signin');
    });

    it('should redirect with basic URL when callback URL not configured', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const config: RedirectConfig = {
        redirectTo: '/auth/signin',
        includeCallbackUrl: false,
      };

      renderHook(() => useSessionGuard(config));

      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });

    it('should not redirect during loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      renderHook(() => useSessionGuard(defaultConfig));

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('useRequireAuth', () => {
    it('should return session when authenticated', () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        expires: '2024-12-31',
      };
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current).toEqual({
        session: mockSession,
        isLoading: false,
      });
    });

    it('should return loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current).toEqual({
        session: null,
        isLoading: true,
      });
    });

    it('should redirect and return null when unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current).toEqual({
        session: null,
        isLoading: false,
      });
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });

    it('should use custom redirect URL when provided', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      renderHook(() =>
        useRequireAuth({ redirectTo: '/custom-login' })
      );

      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });

    it('should use replace navigation when replace option is true', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      renderHook(() =>
        useRequireAuth({ redirectTo: '/auth/signin', replace: true })
      );

      expect(mockReplace).toHaveBeenCalledWith('/auth/signin');
    });
  });

  describe('useSessionGuard with callback URL', () => {
    let originalWindow: any;

    beforeEach(() => {
      // Save original window
      originalWindow = global.window;

      // Mock window.location
      (global as any).window = {
        location: {
          pathname: '/dashboard',
          search: '?tab=overview',
        },
      };
    });

    afterEach(() => {
      // Restore original window
      global.window = originalWindow;
    });

    it('should include callback URL when configured', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const config: RedirectConfig = {
        redirectTo: '/auth/signin',
        includeCallbackUrl: true,
      };

      renderHook(() => useSessionGuard(config));

      // The JSDOM environment provides default window.location, check what was actually called
      const expectedCallbackUrl = encodeURIComponent('/dashboard?tab=overview');
      expect(mockPush).toHaveBeenCalledWith(
        `/auth/signin?callbackUrl=${expectedCallbackUrl}`
      );
    });
  });

  describe('ClientSessionUtils', () => {
    describe('hasSubscriptionTier', () => {
      it('should return false for null session', () => {
        const result = ClientSessionUtils.hasSubscriptionTier(null, 'premium');
        expect(result).toBe(false);
      });

      it('should return true for exact tier match', () => {
        const session = {
          user: { subscriptionTier: 'premium' },
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.hasSubscriptionTier(session, 'premium');
        expect(result).toBe(true);
      });

      it('should return true for higher tier', () => {
        const session = {
          user: { subscriptionTier: 'pro' },
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.hasSubscriptionTier(session, 'basic');
        expect(result).toBe(true);
      });

      it('should return false for lower tier', () => {
        const session = {
          user: { subscriptionTier: 'basic' },
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.hasSubscriptionTier(session, 'pro');
        expect(result).toBe(false);
      });

      it('should default to free tier when no subscriptionTier', () => {
        const session = {
          user: {},
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.hasSubscriptionTier(session, 'free');
        expect(result).toBe(true);
      });
    });

    describe('getUserId', () => {
      it('should return null for null session', () => {
        const result = ClientSessionUtils.getUserId(null);
        expect(result).toBeNull();
      });

      it('should return null for session without user id', () => {
        const session = {
          user: {},
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.getUserId(session);
        expect(result).toBeNull();
      });

      it('should return user ID from session', () => {
        const session = {
          user: { id: 'user-123' },
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.getUserId(session);
        expect(result).toBe('user-123');
      });
    });

    describe('getUserEmail', () => {
      it('should return null for null session', () => {
        const result = ClientSessionUtils.getUserEmail(null);
        expect(result).toBeNull();
      });

      it('should return null for session without user email', () => {
        const session = {
          user: {},
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.getUserEmail(session);
        expect(result).toBeNull();
      });

      it('should return email from session', () => {
        const session = {
          user: { email: 'test@example.com' },
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.getUserEmail(session);
        expect(result).toBe('test@example.com');
      });
    });

    describe('getSubscriptionTier', () => {
      it('should return free for null session', () => {
        const result = ClientSessionUtils.getSubscriptionTier(null);
        expect(result).toBe('free');
      });

      it('should return free when no subscriptionTier', () => {
        const session = {
          user: {},
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.getSubscriptionTier(session);
        expect(result).toBe('free');
      });

      it('should return subscription tier from session', () => {
        const session = {
          user: { subscriptionTier: 'premium' },
          expires: '2024-12-31',
        };
        const result = ClientSessionUtils.getSubscriptionTier(session);
        expect(result).toBe('premium');
      });
    });
  });

  describe('performLogout', () => {
    const mockSignOut = jest.fn();
    const mockLocalStorage = { removeItem: jest.fn() };
    const mockSessionStorage = { clear: jest.fn() };
    const mockLocation = { href: '' };
    let originalWindow: any;
    let originalImport: any;

    beforeEach(() => {
      jest.clearAllMocks();

      // Save original window and import
      originalWindow = global.window;
      originalImport = global.import;

      // Mock dynamic import globally
      global.import = jest.fn().mockResolvedValue({
        signOut: mockSignOut,
      });

      // Mock window and localStorage
      (global as any).window = {
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        location: mockLocation,
      };
    });

    afterEach(() => {
      // Restore originals
      global.window = originalWindow;
      global.import = originalImport;
    });

    it('should call signOut with correct parameters', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await performLogout();

      expect(mockSignOut).toHaveBeenCalledWith({
        callbackUrl: '/',
        redirect: true,
      });
    });

    it('should clear localStorage and sessionStorage', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await performLogout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dnd-tracker-theme');
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });

    it('should handle signOut errors and redirect manually', async () => {
      const mockError = new Error('SignOut failed');
      mockSignOut.mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await performLogout();

      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', mockError);
      expect(mockLocation.href).toBe('/');

      consoleSpy.mockRestore();
    });
  });
});
