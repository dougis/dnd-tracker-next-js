'use client';

import React from 'react';
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
  renderSettingsPage,
  expectLoadingState,
  expectUnauthenticatedState,
  expectAuthenticatedState,
  expectSettingsComponent,
  expectPageStructure,
  expectAccessibilityStructure,
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

      renderSettingsPage();

      expectLoadingState();
    });

    it('should show unauthenticated message when user is not signed in', () => {
      mockUseSession.mockReturnValue(unauthenticatedSessionMock);

      renderSettingsPage();

      expectUnauthenticatedState();
    });

    it('should render settings component when user is authenticated', () => {
      mockUseSession.mockReturnValue(createSessionMock());

      renderSettingsPage();

      expectAuthenticatedState();
    });
  });

  describe('Page Structure', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(createSessionMock());
    });

    it('should have complete page structure', () => {
      renderSettingsPage();

      expectPageStructure();
    });
  });

  describe('User Context', () => {
    it('should handle user with only email', () => {
      mockUseSession.mockReturnValue(userWithEmailOnlyMock);

      renderSettingsPage();

      expectSettingsComponent();
    });

    it('should handle user with name and email', () => {
      mockUseSession.mockReturnValue(userWithNameAndEmailMock);

      renderSettingsPage();

      expectSettingsComponent();
    });
  });

  describe('Error Handling', () => {
    it('should handle session data without user object', () => {
      mockUseSession.mockReturnValue(sessionWithoutUserMock);

      renderSettingsPage();

      expectUnauthenticatedState();
    });

    it('should handle null session data with authenticated status', () => {
      mockUseSession.mockReturnValue(nullSessionMock);

      renderSettingsPage();

      expectUnauthenticatedState();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(createSessionMock());
    });

    it('should have proper semantic structure', () => {
      renderSettingsPage();

      expectAccessibilityStructure();
    });

    it('should have accessible loading state', () => {
      mockUseSession.mockReturnValue(loadingSessionMock);

      renderSettingsPage();

      expectLoadingState();
    });
  });
});