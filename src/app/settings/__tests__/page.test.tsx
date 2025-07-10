'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import SettingsPage from '../page';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock AppLayout
jest.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock Settings component
jest.mock('@/components/settings', () => ({
  Settings: () => <div data-testid="settings-component">Settings Component</div>,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication States', () => {
    it('should show loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('settings-component')).not.toBeInTheDocument();
    });

    it('should show unauthenticated message when user is not signed in', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByText('Please sign in to access your settings.')).toBeInTheDocument();
      expect(screen.queryByTestId('settings-component')).not.toBeInTheDocument();
    });

    it('should render settings component when user is authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-component')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument();
    });
  });

  describe('Page Structure', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('should render within AppLayout', () => {
      render(<SettingsPage />);

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<SettingsPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Settings');
    });

    it('should have container styling for responsive design', () => {
      render(<SettingsPage />);

      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });
  });

  describe('User Context', () => {
    it('should handle user with only email', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-component')).toBeInTheDocument();
    });

    it('should handle user with name and email', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-component')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle session data without user object', () => {
      mockUseSession.mockReturnValue({
        data: {
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByText('Please sign in to access your settings.')).toBeInTheDocument();
    });

    it('should handle null session data with authenticated status', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      expect(screen.getByText('Please sign in to access your settings.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('should have proper semantic structure', () => {
      render(<SettingsPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have accessible loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<SettingsPage />);

      const loadingElement = screen.getByText('Loading...');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement.closest('div')).toHaveClass('text-muted-foreground');
    });
  });
});