/**
 * Shared mock configurations to reduce duplication across test files
 * These exports can be used to standardize mock setups
 */

// Mock NextAuth JWT module configuration
export const nextAuthJWTMock = () => ({
  getToken: jest.fn(),
});

// Mock NextResponse configuration
export const nextResponseMock = () => {
  const mockRedirect = jest.fn();
  const mockNext = jest.fn();
  const mockJson = jest.fn();

  return {
    mocks: { mockRedirect, mockNext, mockJson },
    mockConfig: {
      NextRequest: jest.fn(),
      NextResponse: {
        redirect: mockRedirect,
        next: mockNext,
        json: mockJson,
      },
    }
  };
};

// Standard environment setup
export const setupTestEnvironment = () => {
  const originalEnv = process.env;
  process.env.NEXTAUTH_SECRET = 'test-secret';
  return () => { process.env = originalEnv; };
};