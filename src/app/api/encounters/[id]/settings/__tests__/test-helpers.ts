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