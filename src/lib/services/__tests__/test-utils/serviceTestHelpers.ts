import { Encounter } from '@/lib/models/encounter';

// Mock setup helpers
export const createMockChain = (mockReturnValue: any) => ({
  sort: jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReturnValue),
      }),
    }),
  }),
});

export const setupSearchMocks = (encounters: any[], totalCount = 1) => {
  (Encounter.find as jest.Mock) = jest.fn().mockReturnValue(createMockChain(encounters));
  (Encounter.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(totalCount);
};

export const setupBasicMock = (method: keyof typeof Encounter, returnValue: any) => {
  (Encounter[method] as jest.Mock) = jest.fn().mockResolvedValue(returnValue);
};

export const setupBasicMockWithSave = (encounter: any, returnValue: any = null) => {
  const mockSave = jest.fn().mockResolvedValue(returnValue || encounter);
  encounter.save = mockSave;
  (Encounter.findById as jest.Mock) = jest.fn().mockResolvedValue(encounter);
  return mockSave;
};

// Expectation helpers
export const expectSuccess = (result: any, expectedData?: any) => {
  expect(result.success).toBe(true);
  if (expectedData !== undefined) {
    expect(result.data).toEqual(expectedData);
  }
};

export const expectError = (result: any, errorCode: string, statusCode?: number) => {
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(errorCode);
  if (statusCode) {
    expect(result.error?.statusCode).toBe(statusCode);
  }
};

export const expectSearchResult = (result: any, encounters: any[], page = 1, total = 1) => {
  expectSuccess(result);
  expect(result.data.encounters).toEqual(encounters);
  expect(result.data.currentPage).toBe(page);
  expect(result.data.totalPages).toBe(total);
  expect(result.data.totalItems).toBe(total);
};

export const expectMethodCalled = (mock: jest.Mock, expectedArgs?: any[]) => {
  expect(mock).toHaveBeenCalled();
  if (expectedArgs) {
    expect(mock).toHaveBeenCalledWith(...expectedArgs);
  }
};