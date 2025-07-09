import { NextRequest } from 'next/server';

export const TEST_USER_ID = '507f1f77bcf86cd799439011';

export const createMockSession = (userId: string = TEST_USER_ID) => ({
  user: {
    id: userId,
    email: 'test@example.com',
  },
});

export const createMockParams = (id: string = TEST_USER_ID) => ({ id });

export const createMockRequest = (data: any, method: 'PATCH' | 'GET' = 'PATCH') => ({
  json: jest.fn().mockResolvedValue(data),
  method,
  headers: new Headers({
    'content-type': 'application/json',
  }),
}) as unknown as NextRequest;

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: TEST_USER_ID,
  email: 'test@example.com',
  displayName: 'John Doe',
  timezone: 'America/New_York',
  dndEdition: 'Pathfinder 2e',
  experienceLevel: 'experienced' as const,
  primaryRole: 'dm' as const,
  ...overrides,
});

export const createRequestBody = (overrides: Partial<any> = {}) => ({
  displayName: 'John Doe',
  timezone: 'America/New_York',
  dndEdition: 'Pathfinder 2e',
  experienceLevel: 'experienced',
  primaryRole: 'dm',
  ...overrides,
});

export const expectSuccessResponse = async (response: Response, expectedData: any) => {
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data).toEqual({
    success: true,
    ...expectedData,
  });
};

export const expectErrorResponse = async (
  response: Response,
  status: number,
  message: string,
  expectErrors: boolean = false
) => {
  const data = await response.json();
  expect(response.status).toBe(status);
  expect(data.success).toBe(false);
  expect(data.message).toBe(message);
  if (expectErrors) {
    expect(Array.isArray(data.errors)).toBe(true);
  }
};