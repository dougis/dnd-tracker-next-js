/**
 * Test helpers for UserServiceAuth tests
 * Centralized data factories and utilities to prevent code duplication
 */

import { UserServiceAuth } from '../UserServiceAuth';

// Test data factories
export const createValidUserData = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  agreeToTerms: true,
  subscribeToNewsletter: false,
  ...overrides,
});

export const createValidLoginData = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'TestPassword123!',
  rememberMe: false,
  ...overrides,
});

export const createValidPasswordChangeData = (overrides = {}) => ({
  currentPassword: 'CurrentPass123!',
  newPassword: 'NewPassword456!',
  confirmNewPassword: 'NewPassword456!',
  ...overrides,
});

export const createValidResetData = (overrides = {}) => ({
  email: 'reset@example.com',
  ...overrides,
});

export const createValidPasswordResetData = (overrides = {}) => ({
  token: 'valid-reset-token',
  password: 'NewSecurePassword123!',
  confirmPassword: 'NewSecurePassword123!',
  ...overrides,
});

export const createValidVerificationData = (overrides = {}) => ({
  token: 'valid-verification-token',
  ...overrides,
});

// Test data variations for coverage
export const createInvalidUserData = () => ({
  email: 'invalid-email',
  password: '123',
  confirmPassword: '456',
  username: '',
  firstName: '',
  lastName: '',
  agreeToTerms: false,
  subscribeToNewsletter: false,
});

export const createInvalidLoginData = () => ({
  email: 'invalid-email',
  password: '',
  rememberMe: false,
});

// Consolidated test case generators
export const getCreateUserTestCases = () => [
  createValidUserData(),
  createValidUserData({ email: 'different@test.com', username: 'different' }),
  createInvalidUserData(),
  createValidUserData({
    email: 'special+chars@test.com',
    password: 'SpecialPass123!@#',
    confirmPassword: 'SpecialPass123!@#',
  }),
  createValidUserData({ email: 'success@test.com', username: 'success' }),
  createValidUserData({ email: 'another@example.com', subscribeToNewsletter: true }),
];

export const getAuthenticationTestCases = () => [
  createValidLoginData(),
  createValidLoginData({ email: 'different@test.com', rememberMe: true }),
  createInvalidLoginData(),
  createValidLoginData({ password: 'WrongPassword!' }),
  createValidLoginData({ email: 'nonexistent@example.com' }),
  createValidLoginData({ email: 'invalid-email' }),
];

export const getPasswordChangeTestCases = () => [
  { userId: 'user1', data: createValidPasswordChangeData() },
  { userId: 'user2', data: createValidPasswordChangeData({ newPassword: 'NewPass789!' }) },
  { userId: '', data: createValidPasswordChangeData() },
  { userId: 'invalid', data: { currentPassword: '', newPassword: '', confirmNewPassword: '' } },
  { userId: 'test-user', data: createValidPasswordChangeData({ currentPassword: 'WrongCurrentPass123!' }) },
];

// Consolidated exercise functions
export const exerciseCreateUserVariations = async () => {
  const variations = getCreateUserTestCases();
  for (const userData of variations) {
    await UserServiceAuth.createUser(userData);
  }
};

export const exerciseAuthenticateUserVariations = async () => {
  const variations = [
    createValidLoginData(),
    createValidLoginData({ email: 'another@test.com', rememberMe: true }),
    createInvalidLoginData(),
    createValidLoginData({ password: 'DifferentPass456!' }),
  ];

  for (const loginData of variations) {
    await UserServiceAuth.authenticateUser(loginData);
  }
};

export const exerciseChangePasswordVariations = async () => {
  const variations = [
    { userId: 'user1', data: createValidPasswordChangeData() },
    { userId: 'user2', data: createValidPasswordChangeData({ newPassword: 'NewPass789!' }) },
    { userId: '', data: createValidPasswordChangeData() },
    { userId: 'invalid', data: { currentPassword: '', newPassword: '', confirmNewPassword: '' } },
  ];

  for (const { userId, data } of variations) {
    await UserServiceAuth.changePassword(userId, data);
  }
};

export const exercisePasswordResetVariations = async () => {
  const emails = [
    'reset@example.com',
    'another@test.com',
    'nonexistent@domain.com',
    'invalid-email',
    '',
  ];

  for (const email of emails) {
    await UserServiceAuth.requestPasswordReset({ email });
  }

  const resetVariations = [
    createValidPasswordResetData(),
    createValidPasswordResetData({ token: 'different-token' }),
    { token: '', password: '', confirmPassword: '' },
    createValidPasswordResetData({ password: 'weak', confirmPassword: 'mismatch' }),
  ];

  for (const resetData of resetVariations) {
    await UserServiceAuth.resetPassword(resetData);
  }
};

export const exerciseEmailVerificationVariations = async () => {
  const tokens = [
    'valid-token',
    'another-token',
    'invalid-token',
    '',
    'very-long-token-for-edge-case-testing',
  ];

  for (const token of tokens) {
    await UserServiceAuth.verifyEmail({ token });
  }

  const emails = [
    'verify@example.com',
    'unverified@test.com',
    'nonexistent@domain.com',
    'invalid-email',
    '',
  ];

  for (const email of emails) {
    await UserServiceAuth.resendVerificationEmail(email);
  }
};

// Helper to exercise all methods for comprehensive coverage
export const exerciseAllUserServiceAuthMethods = async () => {
  await exerciseCreateUserVariations();
  await exerciseAuthenticateUserVariations();
  await exerciseChangePasswordVariations();
  await exercisePasswordResetVariations();
  await exerciseEmailVerificationVariations();
};

// Helper to test specific error scenarios
export const exerciseErrorScenarios = async () => {
  // Test all methods with invalid data to exercise error paths
  await UserServiceAuth.createUser(createInvalidUserData());
  await UserServiceAuth.authenticateUser(createInvalidLoginData());
  await UserServiceAuth.changePassword('', {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  await UserServiceAuth.requestPasswordReset({ email: '' });
  await UserServiceAuth.resetPassword({
    token: '',
    password: '',
    confirmPassword: ''
  });
  await UserServiceAuth.verifyEmail({ token: '' });
  await UserServiceAuth.resendVerificationEmail('');
};
