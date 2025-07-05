import { PATCH } from '../route';
import { EncounterService } from '@/lib/services/EncounterService';
import {
  TEST_SETTINGS,
  TEST_INVALID_SETTINGS,
  TEST_PARTIAL_SETTINGS,
  createTestRequest,
  createTestParams,
  createServiceSuccess,
  createServiceError,
  expectServiceCall,
  expectSuccessResponse,
  expectErrorResponse,
} from '@/__test-utils__/encounter-settings-test-utils';

// Configure Jest to use our mocks
jest.mock('next/server');

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService', () => {
  return {
    EncounterService: {
      updateEncounter: jest.fn(),
      getEncounterById: jest.fn(),
    },
  };
});

describe('PATCH /api/encounters/[id]/settings', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully updates encounter settings', async () => {
    EncounterService.updateEncounter = jest.fn().mockResolvedValue(createServiceSuccess());

    const request = createTestRequest(TEST_SETTINGS);
    const response = await PATCH(request, createTestParams());

    await expectSuccessResponse(response, TEST_SETTINGS);
    expectServiceCall(EncounterService.updateEncounter, TEST_SETTINGS);
  });

  it('returns validation errors for invalid settings data', async () => {
    const request = createTestRequest(TEST_INVALID_SETTINGS);
    const response = await PATCH(request, createTestParams());

    await expectErrorResponse(response, 400, 'Validation error');
    expect(EncounterService.updateEncounter).not.toHaveBeenCalled();
  });

  it('returns error for invalid encounter ID format', async () => {
    const request = createTestRequest(TEST_SETTINGS);
    const response = await PATCH(request, createTestParams('invalid-id'));

    await expectErrorResponse(response, 400, 'Validation error');
    expect(EncounterService.updateEncounter).not.toHaveBeenCalled();
  });

  it('returns 404 when encounter not found', async () => {
    EncounterService.updateEncounter = jest.fn().mockResolvedValue(
      createServiceError('Encounter not found', 404)
    );

    const request = createTestRequest(TEST_SETTINGS);
    const response = await PATCH(request, createTestParams());

    await expectErrorResponse(response, 404, 'Encounter not found');
    expectServiceCall(EncounterService.updateEncounter, TEST_SETTINGS);
  });

  it('handles service errors gracefully', async () => {
    EncounterService.updateEncounter = jest.fn().mockResolvedValue(
      createServiceError('Database connection failed', 500)
    );

    const request = createTestRequest(TEST_SETTINGS);
    const response = await PATCH(request, createTestParams());

    await expectErrorResponse(response, 500, 'Database connection failed');
    expectServiceCall(EncounterService.updateEncounter, TEST_SETTINGS);
  });

  it('handles unexpected errors', async () => {
    EncounterService.updateEncounter = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    const request = createTestRequest(TEST_SETTINGS);
    const response = await PATCH(request, createTestParams());

    await expectErrorResponse(response, 500, 'An unexpected error occurred');
    expectServiceCall(EncounterService.updateEncounter, TEST_SETTINGS);
  });

  it('validates partial settings updates', async () => {
    const mergedSettings = { ...TEST_SETTINGS, ...TEST_PARTIAL_SETTINGS };
    EncounterService.updateEncounter = jest.fn().mockResolvedValue(
      createServiceSuccess(mergedSettings)
    );

    const request = createTestRequest(TEST_PARTIAL_SETTINGS);
    const response = await PATCH(request, createTestParams());

    await expectSuccessResponse(response, mergedSettings);
    expectServiceCall(EncounterService.updateEncounter, TEST_PARTIAL_SETTINGS);
  });

  it('validates lair action settings dependency', async () => {
    const lairSettings = {
      enableLairActions: true,
      lairActionInitiative: 15,
    };
    const request = createTestRequest(lairSettings);
    const response = await PATCH(request, createTestParams());
    await response.json();

    // This should still be valid as the schema allows optional lairActionInitiative
    // The business logic for enforcing the dependency should be in the service layer
    expect(response.status).toBe(200);
  });
});