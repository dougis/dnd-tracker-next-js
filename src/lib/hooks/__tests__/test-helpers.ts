import type { IEncounterSettings } from '@/lib/models/encounter/interfaces';

export const MOCK_ENCOUNTER_ID = '507f1f77bcf86cd799439011';

export const MOCK_SETTINGS: Partial<IEncounterSettings> = {
  allowPlayerVisibility: true,
  autoRollInitiative: false,
};

export const MOCK_PARTIAL_SETTINGS: Partial<IEncounterSettings> = {
  allowPlayerVisibility: false,
};

export const MOCK_OPTIMISTIC_SETTINGS: Partial<IEncounterSettings> = {
  enableLairActions: true,
};

export function createMockFetch(success: boolean, responseData?: any) {
  return jest.fn().mockResolvedValue({
    ok: success,
    json: jest.fn().mockResolvedValue(
      success
        ? { success: true, ...responseData }
        : { success: false, message: 'Error occurred' }
    ),
  });
}

export function createMockErrorFetch() {
  return jest.fn().mockRejectedValue(new Error('Network error'));
}

export function createMockDelayedFetch(delay: number = 100) {
  return jest.fn().mockImplementation(() =>
    new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      }), delay)
    )
  );
}

export function createMockSuccessResponse() {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({ success: true }),
  };
}

export function createMockErrorResponse(message = 'Validation error') {
  return {
    ok: false,
    json: jest.fn().mockResolvedValue({
      success: false,
      message
    }),
  };
}