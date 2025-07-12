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