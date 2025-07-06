import { NextRequest } from 'next/server';

// Mock request creators
export const createMockAuthRequest = (
  body: any,
  options: {
    method?: string;
    headers?: Record<string, string>;
    url?: string;
  } = {}
): NextRequest => {
  const { method = 'POST', headers = {}, url = 'https://example.com/api/auth/test' } = options;

  const req = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  (req.json as jest.Mock) = jest.fn().mockResolvedValue(body);

  return req;
};

// Response assertion helpers
export const expectSuccessfulAuthResponse = async (
  response: Response,
  expectedMessage?: string
) => {
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  if (expectedMessage) {
    expect(data.message).toBe(expectedMessage);
  }
  return data;
};

export const expectValidationError = async (
  response: Response,
  expectedField?: string,
  expectedErrors?: string[]
) => {
  const data = await response.json();
  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
  expect(data.message).toBe('Validation error');

  if (expectedField) {
    expect(data.errors).toBeDefined();
    expect(Array.isArray(data.errors)).toBe(true);
    const fieldError = data.errors.find((err: any) => err.field === expectedField);
    expect(fieldError).toBeDefined();
  }

  if (expectedErrors) {
    expectedErrors.forEach(error => {
      const hasError = data.errors.some((err: any) => err.message.includes(error));
      expect(hasError).toBe(true);
    });
  }

  return data;
};

export const expectAuthError = async (
  response: Response,
  status: number,
  expectedMessage: string
) => {
  const data = await response.json();
  expect(response.status).toBe(status);
  expect(data.success).toBe(false);
  expect(data.message).toBe(expectedMessage);
  return data;
};

export const expectServerError = async (response: Response) => {
  const data = await response.json();
  expect(response.status).toBe(500);
  expect(data.success).toBe(false);
  expect(data.message).toBe('An unexpected error occurred');
  return data;
};

// Service mock setup helpers
export const setupUserServiceMock = (
  method: keyof typeof import('@/lib/services/UserService').UserService,
  returnValue: any,
  shouldReject = false
) => {
  const { UserService } = require('@/lib/services/UserService');

  if (shouldReject) {
    UserService[method] = jest.fn().mockRejectedValue(returnValue);
  } else {
    UserService[method] = jest.fn().mockResolvedValue(returnValue);
  }

  return UserService[method];
};

// Common test patterns
export const runValidationErrorTest = async (
  apiFunction: Function,
  invalidData: any,
  expectedField: string,
  expectedErrors?: string[]
) => {
  const request = createMockAuthRequest(invalidData);
  const response = await apiFunction(request);
  await expectValidationError(response, expectedField, expectedErrors);
};

export const runMissingFieldTest = async (
  apiFunction: Function,
  validData: any,
  fieldToRemove: string
) => {
  const invalidData = { ...validData };
  delete invalidData[fieldToRemove];

  await runValidationErrorTest(
    apiFunction,
    invalidData,
    fieldToRemove,
    ['Required']
  );
};

export const runInvalidFormatTest = async (
  apiFunction: Function,
  validData: any,
  field: string,
  invalidValue: any,
  _expectedError?: string
) => {
  const invalidData = { ...validData, [field]: invalidValue };

  const request = createMockAuthRequest(invalidData);
  const response = await apiFunction(request);
  await expectValidationError(response, field);
};

// Common test data
export const createValidEmailData = () => ({
  email: 'test@example.com',
});

export const createValidPasswordData = () => ({
  password: 'ValidPass123!',
});

export const createValidRegisterData = () => ({
  email: 'test@example.com',
  password: 'ValidPass123!',
  name: 'Test User',
});

export const createValidLoginData = () => ({
  email: 'test@example.com',
  password: 'ValidPass123!',
});

export const createValidResetPasswordData = () => ({
  token: 'valid-reset-token',
  password: 'NewValidPass123!',
  confirmPassword: 'NewValidPass123!',
});

export const createValidVerificationData = () => ({
  token: 'valid-verification-token',
});

// Mock user data
export const createMockUser = (overrides: any = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  isEmailVerified: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockVerifiedUser = () => createMockUser({
  isEmailVerified: true
});