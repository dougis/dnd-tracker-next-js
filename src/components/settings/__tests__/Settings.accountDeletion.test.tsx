'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';
import { mockSessions, getSettingsSelectors } from './test-helpers';
import {
  setupSettingsTestMocks,
  setupSettingsBeforeEach,
  mockDeleteAccountResponse,
  mockApiDelay,
  mockNetworkError,
  mockUseSession,
  mockSignOut,
  mockFetch
} from './shared-settings-test-setup';
import '@testing-library/jest-dom';

// Setup all mocks
setupSettingsTestMocks();

describe('Settings Component - Account Deletion', () => {
  const selectors = getSettingsSelectors();

  const setupAccountDeletionModal = () => {
    render(<Settings />);
    const deleteButton = selectors.deleteAccountButton();
    fireEvent.click(deleteButton);
    return deleteButton;
  };

  beforeEach(() => {
    setupSettingsBeforeEach(mockSessions.free);
  });

  describe('Delete Account Button', () => {
    it('should render delete account button', () => {
      render(<Settings />);

      const deleteButton = selectors.deleteAccountButton();
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('bg-destructive');
    });

    it('should open delete confirmation modal when delete button is clicked', () => {
      setupAccountDeletionModal();

      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText(/All your data will be permanently removed/)).toBeInTheDocument();
    });
  });

  describe('Delete Confirmation Modal', () => {
    beforeEach(() => {
      setupAccountDeletionModal();
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
      setupAccountDeletionModal();
    });

    it('should call delete API when confirm is clicked', async () => {
      mockDeleteAccountResponse(true);

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users/1/profile',
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
    });

    it('should sign out user after successful deletion', async () => {
      mockDeleteAccountResponse(true);

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          callbackUrl: '/',
          redirect: true,
        });
      });
    });

    it('should close modal after successful deletion', async () => {
      mockDeleteAccountResponse(true);

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
      });
    });

    it('should show error message when deletion fails', async () => {
      mockDeleteAccountResponse(false, 'Failed to delete account');

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete account/)).toBeInTheDocument();
      });

      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockNetworkError('Network error');

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/An error occurred while deleting your account|Network error/)).toBeInTheDocument();
      });

      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      setupAccountDeletionModal();
    });

    it('should disable confirm button during deletion', async () => {
      mockApiDelay(100);

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      expect(confirmButton).toBeDisabled();
      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });

    it('should show loading text during deletion', async () => {
      mockApiDelay(100);

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });
  });
});