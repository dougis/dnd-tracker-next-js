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