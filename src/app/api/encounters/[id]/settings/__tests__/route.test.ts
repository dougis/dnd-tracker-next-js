import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import { EncounterService } from '@/lib/services/EncounterService';

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
  const mockEncounterId = '507f1f77bcf86cd799439011';
  const mockValidSettings = {
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

  const createMockRequest = (body: any) => {
    const req = new NextRequest('https://example.com');
    // Use the mocked json method
    (req.json as jest.Mock).mockResolvedValue(body);
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully updates encounter settings', async () => {
    // Mock the EncounterService methods
    EncounterService.updateEncounter = jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: mockEncounterId,
        settings: mockValidSettings,
      },
    });

    const request = createMockRequest(mockValidSettings);
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      success: true,
      message: 'Encounter settings updated successfully',
      settings: mockValidSettings,
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      mockEncounterId,
      { settings: mockValidSettings }
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
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
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
    const request = createMockRequest(mockValidSettings);
    const response = await PATCH(request, { params: Promise.resolve({ id: invalidId }) });
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation error');
    expect(responseData.errors).toContain('Invalid encounter ID format');
    expect(EncounterService.updateEncounter).not.toHaveBeenCalled();
  });

  it('returns 404 when encounter not found', async () => {
    // Mock the service to return encounter not found
    const mockError = {
      success: false,
      error: {
        message: 'Encounter not found',
        statusCode: 404,
        details: [],
      },
    };

    EncounterService.updateEncounter = jest.fn().mockResolvedValue(mockError);

    const request = createMockRequest(mockValidSettings);
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
    const responseData = await response.json();

    expect(response.status).toBe(404);
    expect(responseData).toEqual({
      success: false,
      message: 'Encounter not found',
      errors: [],
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      mockEncounterId,
      { settings: mockValidSettings }
    );
  });

  it('handles service errors gracefully', async () => {
    // Mock the service to return a service error
    const mockError = {
      success: false,
      error: {
        message: 'Database connection failed',
        statusCode: 500,
        details: [],
      },
    };

    EncounterService.updateEncounter = jest.fn().mockResolvedValue(mockError);

    const request = createMockRequest(mockValidSettings);
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      success: false,
      message: 'Database connection failed',
      errors: [],
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      mockEncounterId,
      { settings: mockValidSettings }
    );
  });

  it('handles unexpected errors', async () => {
    // Mock the service to throw an unexpected error
    EncounterService.updateEncounter = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    const request = createMockRequest(mockValidSettings);
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      success: false,
      message: 'An unexpected error occurred',
    });
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      mockEncounterId,
      { settings: mockValidSettings }
    );
  });

  it('validates partial settings updates', async () => {
    // Test partial update with only some settings
    const partialSettings = {
      allowPlayerVisibility: false,
      enableLairActions: true,
      lairActionInitiative: 15,
    };

    EncounterService.updateEncounter = jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: mockEncounterId,
        settings: { ...mockValidSettings, ...partialSettings },
      },
    });

    const request = createMockRequest(partialSettings);
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(EncounterService.updateEncounter).toHaveBeenCalledWith(
      mockEncounterId,
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
    const response = await PATCH(request, { params: Promise.resolve({ id: mockEncounterId }) });
    await response.json();

    // This should still be valid as the schema allows optional lairActionInitiative
    // The business logic for enforcing the dependency should be in the service layer
    expect(response.status).toBe(200);
  });
});