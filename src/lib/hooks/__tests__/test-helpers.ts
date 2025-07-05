import type { IEncounterSettings } from '@/lib/models/encounter/interfaces';

export const MOCK_ENCOUNTER_ID = '507f1f77bcf86cd799439011';

export const MOCK_SETTINGS: Partial<IEncounterSettings> = {
  allowPlayerVisibility: true,
  autoRollInitiative: false,
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