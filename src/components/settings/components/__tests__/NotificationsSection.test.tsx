import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  createDefaultProps,
  renderNotificationsSection,
  getSwitchElements,
  createLoadingProps,
  createAllDisabledProps,
  createAllEnabledProps,
} from './notifications-test-helpers';

describe('NotificationsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render notifications section with correct title', () => {
      renderNotificationsSection();

      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByText('Manage how you receive updates and alerts')).toBeInTheDocument();
    });

    it('should render all notification switches', () => {
      renderNotificationsSection();

      expect(screen.getByLabelText('Email notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Combat reminders')).toBeInTheDocument();
      expect(screen.getByLabelText('Encounter updates')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderNotificationsSection();

      expect(screen.getByRole('button', { name: 'Save Notifications' })).toBeInTheDocument();
    });
  });

  describe('Switch States', () => {
    it('should show correct switch states', () => {
      renderNotificationsSection();

      const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

      expect(emailSwitch).toBeChecked();
      expect(combatSwitch).not.toBeChecked();
      expect(encounterSwitch).toBeChecked();
    });

    it('should handle switch changes', () => {
      const mockOnNotificationChange = jest.fn();
      const props = createDefaultProps({ onNotificationChange: mockOnNotificationChange });
      renderNotificationsSection(props);

      const { emailSwitch } = getSwitchElements();
      fireEvent.click(emailSwitch);

      expect(mockOnNotificationChange).toHaveBeenCalledWith('email');
    });

    it('should handle combat switch changes', () => {
      const mockOnNotificationChange = jest.fn();
      const props = createDefaultProps({ onNotificationChange: mockOnNotificationChange });
      renderNotificationsSection(props);

      const { combatSwitch } = getSwitchElements();
      fireEvent.click(combatSwitch);

      expect(mockOnNotificationChange).toHaveBeenCalledWith('combat');
    });

    it('should handle encounter switch changes', () => {
      const mockOnNotificationChange = jest.fn();
      const props = createDefaultProps({ onNotificationChange: mockOnNotificationChange });
      renderNotificationsSection(props);

      const { encounterSwitch } = getSwitchElements();
      fireEvent.click(encounterSwitch);

      expect(mockOnNotificationChange).toHaveBeenCalledWith('encounters');
    });
  });

  describe('Loading State', () => {
    it('should disable switches when loading', () => {
      renderNotificationsSection(createLoadingProps());

      const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

      expect(emailSwitch).toBeDisabled();
      expect(combatSwitch).toBeDisabled();
      expect(encounterSwitch).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      renderNotificationsSection(createLoadingProps());

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', () => {
      const mockOnSubmit = jest.fn();
      const props = createDefaultProps({ onSubmit: mockOnSubmit });
      renderNotificationsSection(props);

      const form = screen.getByRole('button', { name: 'Save Notifications' }).closest('form');
      fireEvent.submit(form!);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when button is clicked', () => {
      const mockOnSubmit = jest.fn();
      const props = createDefaultProps({ onSubmit: mockOnSubmit });
      renderNotificationsSection(props);

      const submitButton = screen.getByRole('button', { name: 'Save Notifications' });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Switch Properties', () => {
    it('should have correct switch ids', () => {
      renderNotificationsSection();

      const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

      expect(emailSwitch).toHaveAttribute('id', 'email-notifications');
      expect(combatSwitch).toHaveAttribute('id', 'combat-reminders');
      expect(encounterSwitch).toHaveAttribute('id', 'encounter-updates');
    });
  });

  describe('Different Notification States', () => {
    it('should handle all notifications disabled', () => {
      renderNotificationsSection(createAllDisabledProps());

      const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

      expect(emailSwitch).not.toBeChecked();
      expect(combatSwitch).not.toBeChecked();
      expect(encounterSwitch).not.toBeChecked();
    });

    it('should handle all notifications enabled', () => {
      renderNotificationsSection(createAllEnabledProps());

      const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

      expect(emailSwitch).toBeChecked();
      expect(combatSwitch).toBeChecked();
      expect(encounterSwitch).toBeChecked();
    });
  });
});