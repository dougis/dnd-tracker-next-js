import { NextRequest } from 'next/server';

export const MOCK_ENCOUNTER_ID = '507f1f77bcf86cd799439011';

export const MOCK_VALID_SETTINGS = {
  allowPlayerVisibility: true,
  autoRollInitiative: false,
  trackResources: true,
  enableLairActions: true,
  lairActionInitiative: 20,
  enableGridMovement: false,
  gridSize: 5,
  roundTimeLimit: 60,
  experienceThreshold: 4,
};

export const MOCK_INVALID_SETTINGS = {
  allowPlayerVisibility: true,
  gridSize: -1, // Invalid: negative grid size
  roundTimeLimit: 15, // Invalid: below minimum 30 seconds
};

export const MOCK_PARTIAL_SETTINGS = {
  allowPlayerVisibility: false,
  enableLairActions: true,
  lairActionInitiative: 15,
};

export const MOCK_LAIR_SETTINGS = {
  enableLairActions: false,
  lairActionInitiative: 20, // Should be ignored/invalid when lair actions disabled
};

export function createMockRequest(body: any) {
  const req = new NextRequest('https://example.com');
  (req.json as jest.Mock).mockResolvedValue(body);
  return req;
}

export function createMockParams(id: string = MOCK_ENCOUNTER_ID) {
  return { params: Promise.resolve({ id }) };
}

export function createMockServiceResponse(success: boolean, data?: any, error?: any) {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : error,
  };
}

export function createSuccessResponse(settings = MOCK_VALID_SETTINGS) {
  return createMockServiceResponse(true, {
    id: MOCK_ENCOUNTER_ID,
    settings,
  });
}

export function createErrorResponse(message: string, statusCode: number, details: any[] = []) {
  return createMockServiceResponse(false, null, {
    message,
    statusCode,
    details,
  });
}