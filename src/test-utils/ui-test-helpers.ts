/**
 * UI testing utilities for consistent component testing
 * This file provides selectors and utilities for UI component tests
 */

// Re-export testing library screen for consistent imports
export { screen } from '@testing-library/react';

/**
 * Settings page selectors - provides consistent selectors for settings tests
 */
export const getSettingsSelectors = () => {
  // Import screen here to avoid circular dependencies
  const { screen } = require('@testing-library/react');

  return {
    // Profile section
    nameInput: () => screen.getByLabelText(/name/i),
    emailInput: () => screen.getByLabelText(/email/i),
    saveProfileButton: () => screen.getByRole('button', { name: /save profile/i }),

    // Notifications section
    emailNotificationToggle: () => screen.getByLabelText(/email notifications/i),
    combatReminderToggle: () => screen.getByLabelText(/combat reminders/i),
    encounterUpdateToggle: () => screen.getByLabelText(/encounter updates/i),
    saveNotificationsButton: () => screen.getByRole('button', { name: /save notifications/i }),

    // Theme section
    themeToggle: () => screen.getByTestId('theme-toggle'),

    // Subscription section
    currentTier: () => screen.getByTestId('current-subscription-tier'),
    upgradeButton: () => screen.getByRole('button', { name: /upgrade plan/i }),
    subscriptionFeatures: () => screen.getByTestId('subscription-features'),

    // Security section
    changePasswordButton: () => screen.getByRole('button', { name: /change password/i }),
    deleteAccountButton: () => screen.getByRole('button', { name: /delete account/i }),

    // Loading and feedback
    loadingIndicator: () => screen.queryByText(/saving\.\.\./i),
    successMessage: () => screen.queryByText(/settings saved successfully/i),
    errorMessage: () => screen.queryByText(/failed to save settings/i),

    // Validation messages
    nameError: () => screen.queryByText(/name is required/i),
    emailError: () => screen.queryByText(/please enter a valid email/i),
  };
};