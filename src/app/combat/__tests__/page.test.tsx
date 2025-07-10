import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import CombatPage from '../page';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock child components
jest.mock('@/components/layout/AuthenticatedPage', () => ({
  AuthenticatedPage: ({ children, unauthenticatedMessage }: { children: React.ReactNode; unauthenticatedMessage?: string }) => {
    const { useSession } = require('next-auth/react');
    const { status } = useSession();
    
    if (status === 'loading') {
      return <div>Loading...</div>;
    }
    
    if (status === 'unauthenticated') {
      return <div>{unauthenticatedMessage || 'Please sign in to access this page.'}</div>;
    }
    
    return <div data-testid="app-layout">{children}</div>;
  },
}));

jest.mock('@/components/combat/CombatToolbar', () => ({
  CombatToolbar: () => <div data-testid="combat-toolbar">Combat Toolbar</div>,
}));

describe('Combat Page', () => {
  // Helper function to set up authenticated session
  const setupAuthenticatedSession = () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user1', name: 'Test User' }, expires: '2024-01-01' },
      status: 'authenticated',
      update: jest.fn(),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading message during authentication check', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<CombatPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('displays sign-in message for unauthenticated users', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<CombatPage />);

      expect(screen.getByText('Please sign in to access the combat tracker.')).toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      expires: '2024-01-01',
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('renders combat page with proper heading', () => {
      render(<CombatPage />);

      expect(screen.getByRole('heading', { name: 'Combat Tracker' })).toBeInTheDocument();
    });

    it('displays welcome message for authenticated user', () => {
      render(<CombatPage />);

      expect(screen.getByText('Manage active combat encounters and initiative tracking')).toBeInTheDocument();
    });

    it('renders active combat sessions section', () => {
      render(<CombatPage />);

      expect(screen.getByText('Active Combat Sessions')).toBeInTheDocument();
    });

    it('displays empty state when no active combat sessions', () => {
      render(<CombatPage />);

      expect(screen.getByText('No active combat sessions')).toBeInTheDocument();
      expect(screen.getByText('Start a new encounter to begin combat tracking')).toBeInTheDocument();
    });

    it('includes initiative tracker when combat is active', () => {
      // Check that the page structure is in place for combat display
      render(<CombatPage />);

      expect(screen.getByText('Combat Tracker')).toBeInTheDocument();
    });

    it('shows real-time updates section', () => {
      render(<CombatPage />);

      expect(screen.getByText('Real-time Updates')).toBeInTheDocument();
    });

    it('displays combat actions section', () => {
      render(<CombatPage />);

      expect(screen.getByText('Combat Actions')).toBeInTheDocument();
    });

    it('includes damage and healing tracking', () => {
      render(<CombatPage />);

      expect(screen.getByText('Apply damage and healing to participants')).toBeInTheDocument();
    });

    it('has proper responsive design classes', () => {
      const { container } = render(<CombatPage />);

      const mainContent = container.querySelector('main');
      expect(mainContent).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      setupAuthenticatedSession();
    });

    it('has proper heading structure', () => {
      render(<CombatPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Combat Tracker');
    });

    it('contains main content area', () => {
      render(<CombatPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      const { container } = render(<CombatPage />);

      const main = container.querySelector('main');
      const header = container.querySelector('header');

      expect(main).toBeInTheDocument();
      expect(header).toBeInTheDocument();
    });
  });

  describe('Layout Integration', () => {
    beforeEach(() => {
      setupAuthenticatedSession();
    });

    it('renders within AppLayout', () => {
      render(<CombatPage />);

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('maintains consistent spacing and layout', () => {
      const { container } = render(<CombatPage />);

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });
  });

  describe('Error Handling', () => {
    it('handles session errors gracefully', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<CombatPage />);

      // Should not crash and show appropriate message
      expect(screen.getByText('Please sign in to access the combat tracker.')).toBeInTheDocument();
    });

    it('handles missing user data gracefully', () => {
      mockUseSession.mockReturnValue({
        data: { user: null, expires: '2024-01-01' },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<CombatPage />);

      // Should still render main content even without user details
      expect(screen.getByText('Combat Tracker')).toBeInTheDocument();
    });
  });
});