import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { SessionContextProvider, useSessionContext } from '../session-context';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Test component to consume context
const TestComponent = () => {
  const context = useSessionContext();

  return (
    <div>
      <div data-testid="loading">
        {context.isLoading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="authenticated">
        {context.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-id">{context.userId || 'no-user'}</div>
      <div data-testid="user-email">{context.userEmail || 'no-email'}</div>
      <div data-testid="subscription-tier">{context.subscriptionTier}</div>
      <div data-testid="has-premium">
        {context.hasMinimumTier('premium') ? 'has-premium' : 'no-premium'}
      </div>
    </div>
  );
};

// Helper function to render component with context
const renderWithContext = () => {
  return render(
    <SessionContextProvider>
      <TestComponent />
    </SessionContextProvider>
  );
};

// Helper function to assert common expectations
const expectTextContent = (testId: string, expectedText: string) => {
  expect(screen.getByTestId(testId)).toHaveTextContent(expectedText);
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

    renderWithContext();

    expectTextContent('loading', 'loading');
    expectTextContent('authenticated', 'not-authenticated');
    expectTextContent('user-id', 'no-user');
    expectTextContent('subscription-tier', 'free');
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

    renderWithContext();

    expectTextContent('loading', 'not-loading');
    expectTextContent('authenticated', 'authenticated');
    expectTextContent('user-id', '123');
    expectTextContent('user-email', 'test@example.com');
    expectTextContent('subscription-tier', 'premium');
    expectTextContent('has-premium', 'has-premium');
  });

  it('should provide unauthenticated state when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    renderWithContext();

    expectTextContent('loading', 'not-loading');
    expectTextContent('authenticated', 'not-authenticated');
    expectTextContent('user-id', 'no-user');
    expectTextContent('subscription-tier', 'free');
    expectTextContent('has-premium', 'no-premium');
  });

  it('should default to free tier when no subscription tier provided', () => {
    const mockSession = {
      user: {
        id: '123',
        email: 'test@example.com',
        subscriptionTier: 'free',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });

    renderWithContext();

    expectTextContent('subscription-tier', 'free');
    expectTextContent('has-premium', 'no-premium');
  });

  it('should throw error when useSessionContext is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow(
      'useSessionContext must be used within a SessionContextProvider'
    );

    console.error = originalError;
  });

  it('should correctly evaluate subscription tier hierarchy', () => {
    const TestTierComponent = () => {
      const context = useSessionContext();

      return (
        <div>
          <div data-testid="has-free">
            {context.hasMinimumTier('free') ? 'yes' : 'no'}
          </div>
          <div data-testid="has-basic">
            {context.hasMinimumTier('basic') ? 'yes' : 'no'}
          </div>
          <div data-testid="has-premium">
            {context.hasMinimumTier('premium') ? 'yes' : 'no'}
          </div>
          <div data-testid="has-pro">
            {context.hasMinimumTier('pro') ? 'yes' : 'no'}
          </div>
          <div data-testid="has-enterprise">
            {context.hasMinimumTier('enterprise') ? 'yes' : 'no'}
          </div>
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
    expectTextContent('has-free', 'yes');
    expectTextContent('has-basic', 'yes');
    expectTextContent('has-premium', 'yes');
    expectTextContent('has-pro', 'no');
    expectTextContent('has-enterprise', 'no');
  });
});
