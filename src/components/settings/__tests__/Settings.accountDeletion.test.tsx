'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession, signOut } from 'next-auth/react';
import { Settings } from '../Settings';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock theme components
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

// Mock the settings form hook
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

const mockSession = {
  user: {
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    subscriptionTier: 'free',
  },
  expires: '2024-12-31',
};

describe('Settings Component - Account Deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });
  });

  describe('Delete Account Button', () => {
    it('should render delete account button', () => {
      render(<Settings />);
      
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('bg-destructive');
    });

    it('should open delete confirmation modal when delete button is clicked', () => {
      render(<Settings />);
      
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);

      // Check for modal elements specifically
      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText(/All your data will be permanently removed/)).toBeInTheDocument();
    });
  });

  describe('Delete Confirmation Modal', () => {
    beforeEach(() => {
      render(<Settings />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);
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
      render(<Settings />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);
    });

    it('should call delete API when confirm is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Account deleted successfully',
        }),
      });

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/users/507f1f77bcf86cd799439011/profile',
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Account deleted successfully',
        }),
      });

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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Account deleted successfully',
        }),
      });

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
      });
    });

    it('should show error message when deletion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Failed to delete account',
        }),
      });

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete account/)).toBeInTheDocument();
      });
      
      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

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
      render(<Settings />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);
    });

    it('should disable confirm button during deletion', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      expect(confirmButton).toBeDisabled();
      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });

    it('should show loading text during deletion', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });
  });
});