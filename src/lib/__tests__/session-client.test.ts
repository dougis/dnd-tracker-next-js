import { useSession } from 'next-auth/react';
import { renderHook } from '@testing-library/react';
import {
  useSessionGuard,
  useRequireAuth,
  useAuthState,
  RedirectConfig,
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
  });
});
