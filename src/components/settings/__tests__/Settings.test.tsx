'use client';

import React from 'react';
import { render, screen } from '@testing-library/react';
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
jest.mock('@/lib/api/users', () => ({
  updateUser: jest.fn(),
}));

// Mock the hook to avoid complex logic in tests
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

    it('should render theme toggle component', () => {
      render(<Settings />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Authentication States', () => {
    it('should not render when user is not authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<Settings />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when session has no user', () => {
      mockUseSession.mockReturnValue({
        data: { expires: '2024-12-31' } as any,
        status: 'authenticated',
        update: jest.fn(),
      });

      const { container } = render(<Settings />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Subscription Display', () => {
    it('should display current subscription tier', () => {
      render(<Settings />);

      expect(screen.getByText('Free Adventurer')).toBeInTheDocument();
      expect(screen.getByText('$0/month')).toBeInTheDocument();
    });

    it('should show upgrade option for free tier', () => {
      render(<Settings />);

      expect(screen.getByRole('button', { name: /upgrade plan/i })).toBeInTheDocument();
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