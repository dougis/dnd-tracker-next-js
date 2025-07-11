'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';
import { mockSessions, getSettingsSelectors } from './test-helpers';
import {
  mockUseSession,
  mockSignOut,
  mockFetch,
  setupSettingsBeforeEach,
  setupAccountDeletionModal,
  createAccountDeletionTestExecutor
} from './shared-settings-test-setup';
import '@testing-library/jest-dom';

// Apply all standard settings test mocks
jest.mock('next-auth/react');
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));
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

// Set global fetch
global.fetch = mockFetch;

describe('Settings Component - Account Deletion', () => {
  const selectors = getSettingsSelectors();

  const openDeletionModal = () => setupAccountDeletionModal(render, fireEvent, screen, selectors, Settings);
  const deletionExecutor = createAccountDeletionTestExecutor(
    fireEvent,
    screen,
    waitFor,
    mockFetch,
    mockSignOut
  );

  beforeEach(() => {
    setupSettingsBeforeEach(mockSessions.free, mockUseSession);
  });

  describe('Delete Account Button', () => {
    it('should render delete account button', () => {
      render(<Settings />);

      const deleteButton = selectors.deleteAccountButton();
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('bg-destructive');
    });

    it('should open delete confirmation modal when delete button is clicked', () => {
      openDeletionModal();

      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText(/All your data will be permanently removed/)).toBeInTheDocument();
    });
  });

  describe('Delete Confirmation Modal', () => {
    beforeEach(() => {
      openDeletionModal();
    });

    it('should display warning message in modal', () => {
      expect(screen.getByText(/Are you sure you want to delete your account/)).toBeInTheDocument();
      expect(screen.getByText(/All your data will be permanently removed/)).toBeInTheDocument();
    });

    it('should have confirm and cancel buttons', () => {
      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should close modal when cancel is clicked', () => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Account Deletion Process', () => {
    beforeEach(() => {
      openDeletionModal();
    });

    it('should call delete API when confirm is clicked', async () => {
      await deletionExecutor.executeSuccessfulDeletion();
    });

    it('should sign out user after successful deletion', async () => {
      await deletionExecutor.executeSuccessfulDeletion();
    });

    it('should close modal after successful deletion', async () => {
      await deletionExecutor.executeSuccessfulDeletion();
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
      });
    });

    it('should show error message when deletion fails', async () => {
      await deletionExecutor.executeFailedDeletion('Failed to delete account');
    });

    it('should handle network errors gracefully', async () => {
      await deletionExecutor.executeNetworkError('Network error');
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      openDeletionModal();
    });

    it('should disable confirm button during deletion', async () => {
      await deletionExecutor.testLoadingState();
    });

    it('should show loading text during deletion', async () => {
      await deletionExecutor.testLoadingState();
    });
  });
});