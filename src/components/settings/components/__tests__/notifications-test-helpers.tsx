import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotificationsSection } from '../NotificationsSection';

export const defaultNotifications = {
  email: true,
  combat: false,
  encounters: true,
  weeklyDigest: false,
  productUpdates: true,
  securityAlerts: true,
};

export const createDefaultProps = (overrides: any = {}) => ({
  notifications: defaultNotifications,
  onNotificationChange: jest.fn(),
  isLoadingNotifications: false,
  onSubmit: jest.fn(),
  ...overrides,
});

export const renderNotificationsSection = (props = createDefaultProps()) => {
  return render(<NotificationsSection {...props} />);
};

export const getSwitchElements = () => {
  const emailSwitch = screen.getByLabelText('Email notifications');
  const combatSwitch = screen.getByLabelText('Combat reminders');
  const encounterSwitch = screen.getByLabelText('Encounter updates');

  return { emailSwitch, combatSwitch, encounterSwitch };
};

export const createLoadingProps = () => createDefaultProps({
  isLoadingNotifications: true,
});

export const createAllDisabledProps = () => createDefaultProps({
  notifications: {
    email: false,
    combat: false,
    encounters: false,
    weeklyDigest: false,
    productUpdates: false,
    securityAlerts: false,
  },
});

export const createAllEnabledProps = () => createDefaultProps({
  notifications: {
    email: true,
    combat: true,
    encounters: true,
    weeklyDigest: true,
    productUpdates: true,
    securityAlerts: true,
  },
});

// Test action helpers
export const setupSwitchTest = (_notificationKey: string) => {
  const mockOnNotificationChange = jest.fn();
  const props = createDefaultProps({ onNotificationChange: mockOnNotificationChange });
  renderNotificationsSection(props);
  const switches = getSwitchElements();
  return { mockOnNotificationChange, switches };
};

export const setupSubmissionTest = () => {
  const mockOnSubmit = jest.fn();
  const props = createDefaultProps({ onSubmit: mockOnSubmit });
  renderNotificationsSection(props);
  return { mockOnSubmit };
};

// Common expectations
export const expectSwitchStates = (expected: { email: boolean; combat: boolean; encounters: boolean }) => {
  const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

  expect(emailSwitch).toBeChecked() === expected.email;
  expect(combatSwitch).toBeChecked() === expected.combat;
  expect(encounterSwitch).toBeChecked() === expected.encounters;
};

export const expectAllSwitchesDisabled = () => {
  const { emailSwitch, combatSwitch, encounterSwitch } = getSwitchElements();

  expect(emailSwitch).toBeDisabled();
  expect(combatSwitch).toBeDisabled();
  expect(encounterSwitch).toBeDisabled();
};