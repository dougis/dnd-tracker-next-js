import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

/**
 * Test helpers for API route testing
 * Reduces code duplication across test files
 */

// Common test data generators
export const createValidUpdateData = () => ({
  name: 'Updated Encounter',
  description: 'Updated description',
  difficulty: 'hard' as const,
  estimatedDuration: 90,
  targetLevel: 6,
  participants: [
    {
      characterId: new Types.ObjectId().toString(),
      name: 'Updated Player',
      type: 'pc' as const,
      maxHitPoints: 60,
      currentHitPoints: 60,
      temporaryHitPoints: 0,
      armorClass: 18,
      initiative: undefined,
      isPlayer: true,
      isVisible: true,
      notes: '',
      conditions: [],
      position: undefined,
    },
  ],
  tags: ['updated', 'test'],
  settings: {
    allowPlayerVisibility: true,
    autoRollInitiative: true,
    trackResources: true,
    enableLairActions: false,
    lairActionInitiative: undefined,
    enableGridMovement: false,
    gridSize: 5,
    roundTimeLimit: undefined,
    experienceThreshold: undefined,
  },
});

export const createInvalidUpdateData = () => ({
  ...createValidUpdateData(),
  name: '', // Invalid empty name
});

export const createInvalidParticipantData = () => ({
  ...createValidUpdateData(),
  participants: [
    {
      name: 'Invalid Participant',
      // Missing required fields
    },
  ],
});

export const createInvalidSettingsData = () => {
  const validData = createValidUpdateData();
  return {
    ...validData,
    settings: {
      ...validData.settings,
      enableLairActions: true,
      // Missing lairActionInitiative when lair actions enabled
    },
  };
};

// Mock request factory
export const createMockRequest = (
  data: any,
  method: 'GET' | 'PUT' | 'DELETE' = 'PUT'
): NextRequest => {
  if (method === 'GET' || method === 'DELETE') {
    return new NextRequest(`http://localhost:3000/api/encounters/test-id`, {
      method,
    });
  }

  return {
    json: jest.fn().mockResolvedValue(data),
    method,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    url: 'http://localhost:3000/api/encounters/test-id',
  } as unknown as NextRequest;
};

// Common test context setup
export const createTestContext = () => ({
  params: Promise.resolve({ id: 'test-id' }),
});

// Async params helper for different IDs
export const createAsyncParams = (id: string) => ({ params: Promise.resolve({ id }) });

// JSON parsing error mock
export const createJsonParseErrorRequest = (): NextRequest => ({
  json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
  method: 'PUT',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  url: 'http://localhost:3000/api/encounters/test-id',
} as unknown as NextRequest);

// Validation test helpers
export const expectValidationError = (response: Response, data: any, field: string) => {
  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
  expect(data.error).toContain(field);
};

export const expectSuccessResponse = (response: Response, data: any) => {
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
};

export const expectErrorResponse = (response: Response, data: any, status: number, message: string) => {
  expect(response.status).toBe(status);
  expect(data.success).toBe(false);
  expect(data.error).toBe(message);
};

// Security test helpers
export const createUnauthorizedEncounter = (differentUserId = 'different-user-id') => ({
  ownerId: differentUserId,
});

export const expectUnauthorizedResponse = (response: Response, data: any) => {
  expect(response.status).toBe(403);
  expect(data.success).toBe(false);
  expect(data.error).toBe('Insufficient permissions');
};

export const expectUnauthenticatedResponse = (response: Response, data: any) => {
  expect(response.status).toBe(401);
  expect(data.success).toBe(false);
  expect(data.error).toBe('Authentication required');
};