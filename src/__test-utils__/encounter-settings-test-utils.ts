/**
 * Shared test utilities for encounter settings to reduce code duplication
 */
import { NextRequest } from 'next/server';

// Common test constants
export const TEST_ENCOUNTER_ID = '507f1f77bcf86cd799439011';

export const TEST_SETTINGS = {
  allowPlayerVisibility: true,
  autoRollInitiative: false,
  trackResources: true,
  enableLairActions: true,
  lairActionInitiative: 20,
  enableGridMovement: false,
  gridSize: 5,
  roundTimeLimit: 60,
  experienceThreshold: 4,
} as const;

export const TEST_PARTIAL_SETTINGS = {
  allowPlayerVisibility: false,
  enableLairActions: true,
  lairActionInitiative: 15,
} as const;

export const TEST_INVALID_SETTINGS = {
  allowPlayerVisibility: true,
  gridSize: -1,
  roundTimeLimit: 15,
} as const;

// API Test Utilities
export function createTestRequest(body: any) {
  const req = new NextRequest('https://example.com', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // Mock the json method to return our test data
  req.json = jest.fn().mockResolvedValue(body);
  return req;
}

export function createTestParams(id: string = TEST_ENCOUNTER_ID) {
  return { params: Promise.resolve({ id }) };
}

export function createServiceSuccess(data: any = TEST_SETTINGS) {
  return {
    success: true,
    data: { id: TEST_ENCOUNTER_ID, settings: data },
  };
}

export function createServiceError(message: string, statusCode: number = 400) {
  return {
    success: false,
    error: { message, statusCode, details: [] },
  };
}

// Hook Test Utilities
export function createFetchSuccess(data?: any) {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      success: true,
      settings: data || TEST_SETTINGS,
    }),
  });
}

export function createFetchError(message = 'Validation error') {
  return jest.fn().mockResolvedValue({
    ok: false,
    json: jest.fn().mockResolvedValue({
      success: false,
      message,
    }),
  });
}

export function createFetchNetworkError() {
  return jest.fn().mockRejectedValue(new Error('Network error'));
}

export function createFetchDelayed(delay = 100) {
  return jest.fn().mockImplementation(() =>
    new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      }), delay)
    )
  );
}

// Component Test Utilities
export function createTestEncounter(overrides: any = {}) {
  return {
    _id: TEST_ENCOUNTER_ID,
    name: 'Test Encounter',
    settings: TEST_SETTINGS,
    ...overrides,
  };
}

export function createMockHookReturn(overrides: any = {}) {
  return {
    loading: false,
    error: null,
    updateSettings: jest.fn(),
    retry: jest.fn(),
    ...overrides,
  };
}

// Common test expectations
export function expectApiCall(mockFetch: jest.Mock, settings: any) {
  expect(mockFetch).toHaveBeenCalledWith(
    `/api/encounters/${TEST_ENCOUNTER_ID}/settings`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }
  );
}

export function expectServiceCall(mockService: jest.Mock, settings: any) {
  expect(mockService).toHaveBeenCalledWith(
    TEST_ENCOUNTER_ID,
    { settings }
  );
}

export function expectSuccessResponse(response: Response, settings: any) {
  expect(response.status).toBe(200);
  return response.json().then(data => {
    expect(data).toEqual({
      success: true,
      message: 'Encounter settings updated successfully',
      settings,
    });
  });
}

export function expectErrorResponse(response: Response, status: number, message?: string) {
  expect(response.status).toBe(status);
  return response.json().then(data => {
    expect(data.success).toBe(false);
    if (message) {
      expect(data.message).toBe(message);
    }
  });
}