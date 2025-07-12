/**
 * Shared test setup utilities to reduce code duplication across test files
 */

export function createTestMocks() {
  const mockRedirect = jest.fn();
  const mockNext = jest.fn();
  const mockJson = jest.fn();
  const mockGetToken = jest.fn();
  
  return { mockRedirect, mockNext, mockJson, mockGetToken };
}

export function resetAllMocks(...mocks: jest.MockedFunction<any>[]) {
  jest.clearAllMocks();
  mocks.forEach(mock => mock.mockReset());
}

export function setupEnvironment() {
  const originalEnv = process.env;
  process.env.NEXTAUTH_SECRET = 'test-secret';
  return () => { process.env = originalEnv; };
}