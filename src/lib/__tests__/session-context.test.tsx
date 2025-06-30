import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import {
  SessionContextProvider,
  useSessionContext,
} from '../session-context';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Test component to consume context
const TestComponent = () => {
  const context = useSessionContext();

  return (
    <div>
      <div data-testid="loading">{context.isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{context.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-id">{context.userId || 'no-user'}</div>
      <div data-testid="user-email">{context.userEmail || 'no-email'}</div>
      <div data-testid="subscription-tier">{context.subscriptionTier}</div>
      <div data-testid="has-premium">{context.hasMinimumTier('premium') ? 'has-premium' : 'no-premium'}</div>
    </div>
  );
};

describe('SessionContextProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    render(
      <SessionContextProvider>
        <TestComponent />
      </SessionContextProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
    expect(screen.getByTestId('subscription-tier')).toHaveTextContent('free');
  });

  it('should provide authenticated state when user is logged in', () => {
    const mockSession = {
      user: {
        id: '123',
        email: 'test@example.com',
        subscriptionTier: 'premium',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    render(
      <SessionContextProvider>
        <TestComponent />
      </SessionContextProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-id')).toHaveTextContent('123');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('subscription-tier')).toHaveTextContent('premium');
    expect(screen.getByTestId('has-premium')).toHaveTextContent('has-premium');
  });

  it('should provide unauthenticated state when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(
      <SessionContextProvider>
        <TestComponent />
      </SessionContextProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
    expect(screen.getByTestId('subscription-tier')).toHaveTextContent('free');
    expect(screen.getByTestId('has-premium')).toHaveTextContent('no-premium');
  });

  it('should default to free tier when no subscription tier provided', () => {
    const mockSession = {
      user: {
        id: '123',
        email: 'test@example.com',
        // No subscriptionTier property
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    render(
      <SessionContextProvider>
        <TestComponent />
      </SessionContextProvider>
    );

    expect(screen.getByTestId('subscription-tier')).toHaveTextContent('free');
    expect(screen.getByTestId('has-premium')).toHaveTextContent('no-premium');
  });

  it('should throw error when useSessionContext is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSessionContext must be used within a SessionContextProvider');

    console.error = originalError;
  });

  it('should correctly evaluate subscription tier hierarchy', () => {
    const TestTierComponent = () => {
      const context = useSessionContext();

      return (
        <div>
          <div data-testid="has-free">{context.hasMinimumTier('free') ? 'yes' : 'no'}</div>
          <div data-testid="has-basic">{context.hasMinimumTier('basic') ? 'yes' : 'no'}</div>
          <div data-testid="has-premium">{context.hasMinimumTier('premium') ? 'yes' : 'no'}</div>
          <div data-testid="has-pro">{context.hasMinimumTier('pro') ? 'yes' : 'no'}</div>
          <div data-testid="has-enterprise">{context.hasMinimumTier('enterprise') ? 'yes' : 'no'}</div>
        </div>
      );
    };

    // Test with premium tier user
    const mockSession = {
      user: {
        id: '123',
        email: 'test@example.com',
        subscriptionTier: 'premium',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    render(
      <SessionContextProvider>
        <TestTierComponent />
      </SessionContextProvider>
    );

    // Premium user should have access to free, basic, and premium, but not pro or enterprise
    expect(screen.getByTestId('has-free')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-basic')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-premium')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-pro')).toHaveTextContent('no');
    expect(screen.getByTestId('has-enterprise')).toHaveTextContent('no');
  });
});
