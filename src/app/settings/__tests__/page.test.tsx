'use client';

import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsPage from '../page';
import '@testing-library/jest-dom';
import {
  mockUseSession,
  createSessionMock,
  loadingSessionMock,
  unauthenticatedSessionMock,
  sessionWithoutUserMock,
  nullSessionMock,
  userWithEmailOnlyMock,
  userWithNameAndEmailMock,
} from './page-test-helpers';

// Mock next-auth
jest.mock('next-auth/react');

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
      mockUseSession.mockReturnValue(loadingSessionMock);

      render(<SettingsPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('settings-component')).not.toBeInTheDocument();
    });

    it('should show unauthenticated message when user is not signed in', () => {
      mockUseSession.mockReturnValue(unauthenticatedSessionMock);

      render(<SettingsPage />);

      expect(screen.getByText('Please sign in to access your settings.')).toBeInTheDocument();
      expect(screen.queryByTestId('settings-component')).not.toBeInTheDocument();
    });

    it('should render settings component when user is authenticated', () => {
      mockUseSession.mockReturnValue(createSessionMock());

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-component')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument();
    });
  });

  describe('Page Structure', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(createSessionMock());
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
      mockUseSession.mockReturnValue(userWithEmailOnlyMock);

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-component')).toBeInTheDocument();
    });

    it('should handle user with name and email', () => {
      mockUseSession.mockReturnValue(userWithNameAndEmailMock);

      render(<SettingsPage />);

      expect(screen.getByTestId('settings-component')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle session data without user object', () => {
      mockUseSession.mockReturnValue(sessionWithoutUserMock);

      render(<SettingsPage />);

      expect(screen.getByText('Please sign in to access your settings.')).toBeInTheDocument();
    });

    it('should handle null session data with authenticated status', () => {
      mockUseSession.mockReturnValue(nullSessionMock);

      render(<SettingsPage />);

      expect(screen.getByText('Please sign in to access your settings.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(createSessionMock());
    });

    it('should have proper semantic structure', () => {
      render(<SettingsPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have accessible loading state', () => {
      mockUseSession.mockReturnValue(loadingSessionMock);

      render(<SettingsPage />);

      const loadingElement = screen.getByText('Loading...');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement.closest('div')).toHaveClass('text-muted-foreground');
    });
  });
});