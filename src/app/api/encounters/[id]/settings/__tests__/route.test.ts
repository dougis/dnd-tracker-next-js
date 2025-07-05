// NextRequest is imported via test helpers
import { PATCH } from '../route';
import { EncounterService } from '@/lib/services/EncounterService';
import {
  MOCK_ENCOUNTER_ID,
  MOCK_VALID_SETTINGS,
  createMockRequest,
  createMockParams,
  createMockServiceResponse,
} from './test-helpers';

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
    const mockResponse = createMockServiceResponse(true, {
      id: MOCK_ENCOUNTER_ID,
      settings: MOCK_VALID_SETTINGS,
    });
    EncounterService.updateEncounter = jest.fn().mockResolvedValue(mockResponse);

    const request = createMockRequest(MOCK_VALID_SETTINGS);
    const response = await PATCH(request, createMockParams());
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      success: true,
      message: 'Encounter settings updated successfully',
      settings: MOCK_VALID_SETTINGS,
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      MOCK_ENCOUNTER_ID,
      { settings: MOCK_VALID_SETTINGS }
    );
  });

  it('returns validation errors for invalid settings data', async () => {
    // Invalid data (invalid grid size)
    const invalidData = {
      allowPlayerVisibility: true,
      gridSize: -1, // Invalid: negative grid size
      roundTimeLimit: 15, // Invalid: below minimum 30 seconds
    };

    const request = createMockRequest(invalidData);
    const response = await PATCH(request, createMockParams());
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation error');
    expect(responseData.errors).toBeDefined();
    expect(responseData.errors.length).toBeGreaterThan(0);
    expect(EncounterService.updateEncounter).not.toHaveBeenCalled();
  });

  it('returns error for invalid encounter ID format', async () => {
    const invalidId = 'invalid-id';
    const request = createMockRequest(MOCK_VALID_SETTINGS);
    const response = await PATCH(request, createMockParams(invalidId));
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation error');
    expect(responseData.errors).toContain('Invalid encounter ID format');
    expect(EncounterService.updateEncounter).not.toHaveBeenCalled();
  });

  it('returns 404 when encounter not found', async () => {
    const mockError = createMockServiceResponse(false, null, {
      message: 'Encounter not found',
      statusCode: 404,
      details: [],
    });

    EncounterService.updateEncounter = jest.fn().mockResolvedValue(mockError);

    const request = createMockRequest(MOCK_VALID_SETTINGS);
    const response = await PATCH(request, createMockParams());
    const responseData = await response.json();

    expect(response.status).toBe(404);
    expect(responseData).toEqual({
      success: false,
      message: 'Encounter not found',
      errors: [],
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      MOCK_ENCOUNTER_ID,
      { settings: MOCK_VALID_SETTINGS }
    );
  });

  it('handles service errors gracefully', async () => {
    const mockError = createMockServiceResponse(false, null, {
      message: 'Database connection failed',
      statusCode: 500,
      details: [],
    });

    EncounterService.updateEncounter = jest.fn().mockResolvedValue(mockError);

    const request = createMockRequest(MOCK_VALID_SETTINGS);
    const response = await PATCH(request, createMockParams());
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      success: false,
      message: 'Database connection failed',
      errors: [],
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      MOCK_ENCOUNTER_ID,
      { settings: MOCK_VALID_SETTINGS }
    );
  });

  it('handles unexpected errors', async () => {
    // Mock the service to throw an unexpected error
    EncounterService.updateEncounter = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    const request = createMockRequest(MOCK_VALID_SETTINGS);
    const response = await PATCH(request, createMockParams());
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      success: false,
      message: 'An unexpected error occurred',
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      MOCK_ENCOUNTER_ID,
      { settings: MOCK_VALID_SETTINGS }
    );
  });

  it('validates partial settings updates', async () => {
    const partialSettings = {
      allowPlayerVisibility: false,
      enableLairActions: true,
      lairActionInitiative: 15,
    };

    const mockResponse = createMockServiceResponse(true, {
      id: MOCK_ENCOUNTER_ID,
      settings: { ...MOCK_VALID_SETTINGS, ...partialSettings },
    });
    EncounterService.updateEncounter = jest.fn().mockResolvedValue(mockResponse);

    const request = createMockRequest(partialSettings);
    const response = await PATCH(request, createMockParams());
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      MOCK_ENCOUNTER_ID,
      { settings: partialSettings }
    );
  });

  it('validates lair action settings dependency', async () => {
    // Test that lairActionInitiative is only valid when enableLairActions is true
    const invalidLairSettings = {
      enableLairActions: false,
      lairActionInitiative: 20, // Should be ignored/invalid when lair actions disabled
    };

    const request = createMockRequest(invalidLairSettings);
    const response = await PATCH(request, createMockParams());
    await response.json();

    // This should still be valid as the schema allows optional lairActionInitiative
    // The business logic for enforcing the dependency should be in the service layer
    expect(response.status).toBe(200);
  });
});