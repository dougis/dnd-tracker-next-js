/**
 * Authentication mock utilities to reduce duplication in auth-related tests
 */

import { createMockSession, createMockUser } from './mock-factories';

export function setupAuthenticatedMocks(mockAuth: jest.MockedFunction<any>, user?: any) {
  const session = createMockSession(user || createMockUser());
  mockAuth.mockResolvedValue(session);
  return session;
}

export function setupUnauthenticatedMocks(mockAuth: jest.MockedFunction<any>) {
  mockAuth.mockResolvedValue(null);
}

export async function expectRedirectToSignin(
  testFunction: () => Promise<any>,
  mockAuth: jest.MockedFunction<any>,
  expectedUrl: string = '/signin?callbackUrl=/parties'
) {
  await expect(testFunction()).rejects.toThrow(`REDIRECT: ${expectedUrl}`);
  expect(mockAuth).toHaveBeenCalled();
}

/**
 * Test scenarios for unauthenticated users with multiple cases
 */
export const unauthenticatedScenarios = [
  { description: 'user is not authenticated', session: null },
  { description: 'session exists but no user', session: {} },
  { description: 'user object is null', session: { user: null } },
  { description: 'user object is undefined', session: { user: undefined } }
];

/**
 * Execute test for all unauthenticated scenarios
 */
export async function testAllUnauthenticatedScenarios(
  mockAuth: jest.MockedFunction<any>,
  testFunction: () => Promise<any>
) {
  for (const { description: _description, session } of unauthenticatedScenarios) {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(session as any);
    await expectRedirectToSignin(testFunction, mockAuth);
  }
}

/**
 * Helper for testing authenticated access with user ID
 */
export async function testAuthenticatedAccess(
  mockAuth: jest.MockedFunction<any>,
  pageFunction: () => Promise<any>,
  userId: string = 'user-123'
) {
  const user = createMockUser({ id: userId });
  setupAuthenticatedMocks(mockAuth, user);
  const result = await pageFunction();

  expect(mockAuth).toHaveBeenCalled();
  expect(result).toBeDefined();

  return result;
}