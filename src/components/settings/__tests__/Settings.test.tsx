'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { Settings } from '../Settings';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock theme components
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

// Mock user API calls
const mockUpdateUser = jest.fn();
jest.mock('@/lib/api/users', () => ({
  updateUser: () => mockUpdateUser(),
}));

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    subscriptionTier: 'free',
  },
  expires: '2024-12-31',
};

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render all settings sections', () => {
      render(<Settings />);

      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByText('Theme & Display')).toBeInTheDocument();
      expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      expect(screen.getByText('Account Security')).toBeInTheDocument();
    });

    it('should display user profile information', () => {
      render(<Settings />);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('should render theme toggle component', () => {
      render(<Settings />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('User Profile Section', () => {
    it('should allow editing user name', async () => {
      render(<Settings />);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      expect(nameInput).toHaveValue('Updated Name');
    });

    it('should validate required fields', async () => {
      render(<Settings />);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should handle save profile action', async () => {
      render(<Settings />);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ name: 'Updated Name' })
        );
      });
    });
  });

  describe('Notification Preferences', () => {
    it('should render notification toggles', () => {
      render(<Settings />);

      expect(screen.getByLabelText('Email notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Combat reminders')).toBeInTheDocument();
      expect(screen.getByLabelText('Encounter updates')).toBeInTheDocument();
    });

    it('should handle notification preference changes', async () => {
      render(<Settings />);

      const emailToggle = screen.getByLabelText('Email notifications');
      fireEvent.click(emailToggle);

      const saveButton = screen.getByRole('button', { name: /save notifications/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            notifications: expect.objectContaining({
              email: false,
            }),
          })
        );
      });
    });
  });

  describe('Subscription Management', () => {
    it('should display current subscription tier', () => {
      render(<Settings />);

      expect(screen.getByText('Free Adventurer')).toBeInTheDocument();
      expect(screen.getByText('$0/month')).toBeInTheDocument();
    });

    it('should show upgrade options for free tier', () => {
      render(<Settings />);

      expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
    });

    it('should display subscription features', () => {
      render(<Settings />);

      expect(screen.getByText('1 party')).toBeInTheDocument();
      expect(screen.getByText('3 encounters')).toBeInTheDocument();
      expect(screen.getByText('10 creatures')).toBeInTheDocument();
    });

    it('should handle upgrade button click', () => {
      render(<Settings />);

      const upgradeButton = screen.getByRole('button', { name: /upgrade plan/i });
      fireEvent.click(upgradeButton);

      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
    });
  });

  describe('Account Security', () => {
    it('should render security options', () => {
      render(<Settings />);

      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('should handle change password action', () => {
      render(<Settings />);

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      fireEvent.click(changePasswordButton);

      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('should handle delete account action with confirmation', () => {
      render(<Settings />);

      const deleteAccountButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteAccountButton);

      expect(screen.getByText('Delete Account')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      render(<Settings />);

      const emailInput = screen.getByDisplayValue('test@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should prevent submission with validation errors', async () => {
      render(<Settings />);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during save', async () => {
      mockUpdateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<Settings />);

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    it('should show success message after save', async () => {
      mockUpdateUser.mockResolvedValue({ success: true });

      render(<Settings />);

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockUpdateUser.mockRejectedValue(new Error('API Error'));

      render(<Settings />);

      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save settings. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive classes', () => {
      render(<Settings />);

      const container = screen.getByTestId('settings-container');
      expect(container).toHaveClass('space-y-6');
    });

    it('should have proper grid layout for larger screens', () => {
      render(<Settings />);

      const grid = screen.getByTestId('settings-grid');
      expect(grid).toHaveClass('grid', 'gap-6', 'lg:grid-cols-2');
    });
  });
});