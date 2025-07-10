import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsSection } from '../NotificationsSection';
import '@testing-library/jest-dom';

const defaultProps = {
  notifications: {
    email: true,
    combat: false,
    encounters: true,
    weeklyDigest: false,
    productUpdates: true,
    securityAlerts: true,
  },
  onNotificationChange: jest.fn(),
  isLoadingNotifications: false,
  onSubmit: jest.fn(),
};

describe('NotificationsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render notifications section with correct title', () => {
      render(<NotificationsSection {...defaultProps} />);

      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByText('Manage how you receive updates and alerts')).toBeInTheDocument();
    });

    it('should render all notification switches', () => {
      render(<NotificationsSection {...defaultProps} />);

      expect(screen.getByLabelText('Email notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Combat reminders')).toBeInTheDocument();
      expect(screen.getByLabelText('Encounter updates')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<NotificationsSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Save Notifications' })).toBeInTheDocument();
    });
  });

  describe('Switch States', () => {
    it('should show correct switch states', () => {
      render(<NotificationsSection {...defaultProps} />);

      const emailSwitch = screen.getByLabelText('Email notifications');
      const combatSwitch = screen.getByLabelText('Combat reminders');
      const encounterSwitch = screen.getByLabelText('Encounter updates');

      expect(emailSwitch).toBeChecked();
      expect(combatSwitch).not.toBeChecked();
      expect(encounterSwitch).toBeChecked();
    });

    it('should handle switch changes', () => {
      render(<NotificationsSection {...defaultProps} />);

      const emailSwitch = screen.getByLabelText('Email notifications');
      fireEvent.click(emailSwitch);

      expect(defaultProps.onNotificationChange).toHaveBeenCalledWith('email');
    });

    it('should handle combat switch changes', () => {
      render(<NotificationsSection {...defaultProps} />);

      const combatSwitch = screen.getByLabelText('Combat reminders');
      fireEvent.click(combatSwitch);

      expect(defaultProps.onNotificationChange).toHaveBeenCalledWith('combat');
    });

    it('should handle encounter switch changes', () => {
      render(<NotificationsSection {...defaultProps} />);

      const encounterSwitch = screen.getByLabelText('Encounter updates');
      fireEvent.click(encounterSwitch);

      expect(defaultProps.onNotificationChange).toHaveBeenCalledWith('encounters');
    });
  });

  describe('Loading State', () => {
    it('should disable switches when loading', () => {
      const loadingProps = {
        ...defaultProps,
        isLoadingNotifications: true,
      };

      render(<NotificationsSection {...loadingProps} />);

      const emailSwitch = screen.getByLabelText('Email notifications');
      const combatSwitch = screen.getByLabelText('Combat reminders');
      const encounterSwitch = screen.getByLabelText('Encounter updates');

      expect(emailSwitch).toBeDisabled();
      expect(combatSwitch).toBeDisabled();
      expect(encounterSwitch).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      const loadingProps = {
        ...defaultProps,
        isLoadingNotifications: true,
      };

      render(<NotificationsSection {...loadingProps} />);

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', () => {
      render(<NotificationsSection {...defaultProps} />);

      const form = screen.getByRole('button', { name: 'Save Notifications' }).closest('form');
      fireEvent.submit(form!);

      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when button is clicked', () => {
      render(<NotificationsSection {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Save Notifications' });
      fireEvent.click(submitButton);

      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });
  });

  describe('Switch Properties', () => {
    it('should have correct switch ids', () => {
      render(<NotificationsSection {...defaultProps} />);

      const emailSwitch = screen.getByLabelText('Email notifications');
      const combatSwitch = screen.getByLabelText('Combat reminders');
      const encounterSwitch = screen.getByLabelText('Encounter updates');

      expect(emailSwitch).toHaveAttribute('id', 'email-notifications');
      expect(combatSwitch).toHaveAttribute('id', 'combat-reminders');
      expect(encounterSwitch).toHaveAttribute('id', 'encounter-updates');
    });
  });

  describe('Different Notification States', () => {
    it('should handle all notifications disabled', () => {
      const allDisabledProps = {
        ...defaultProps,
        notifications: {
          email: false,
          combat: false,
          encounters: false,
          weeklyDigest: false,
          productUpdates: false,
          securityAlerts: false,
        },
      };

      render(<NotificationsSection {...allDisabledProps} />);

      const emailSwitch = screen.getByLabelText('Email notifications');
      const combatSwitch = screen.getByLabelText('Combat reminders');
      const encounterSwitch = screen.getByLabelText('Encounter updates');

      expect(emailSwitch).not.toBeChecked();
      expect(combatSwitch).not.toBeChecked();
      expect(encounterSwitch).not.toBeChecked();
    });

    it('should handle all notifications enabled', () => {
      const allEnabledProps = {
        ...defaultProps,
        notifications: {
          email: true,
          combat: true,
          encounters: true,
          weeklyDigest: true,
          productUpdates: true,
          securityAlerts: true,
        },
      };

      render(<NotificationsSection {...allEnabledProps} />);

      const emailSwitch = screen.getByLabelText('Email notifications');
      const combatSwitch = screen.getByLabelText('Combat reminders');
      const encounterSwitch = screen.getByLabelText('Encounter updates');

      expect(emailSwitch).toBeChecked();
      expect(combatSwitch).toBeChecked();
      expect(encounterSwitch).toBeChecked();
    });
  });
});