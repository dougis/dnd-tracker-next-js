import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import DashboardPage from '../page';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock child components
jest.mock('@/components/dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard-component">Dashboard Component</div>,
}));

jest.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            subscriptionTier: 'free',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    test('renders dashboard page with layout', () => {
      render(<DashboardPage />);

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
    });

    test('renders dashboard title', () => {
      render(<DashboardPage />);

      expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
    });

    test('renders welcome message with user name', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });
    });

    test('renders loading state', () => {
      render(<DashboardPage />);

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });
    });

    test('renders unauthenticated message', () => {
      render(<DashboardPage />);

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to view your dashboard.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            subscriptionTier: 'free',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    test('has proper heading structure', () => {
      render(<DashboardPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Dashboard');
    });

    test('contains main content area', () => {
      render(<DashboardPage />);

      const main = screen.getByRole('main', { hidden: true });
      expect(main).toBeInTheDocument();
    });
  });
});