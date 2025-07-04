import {
  processSuccessfulResponse,
  processErrorResponse,
  fetchEncountersData,
  createStateUpdaters,
} from '../dataFetchHelpers';
import { EncounterService } from '@/lib/services/EncounterService';
import { transformEncounter } from '../encounterTransform';
import { buildSearchParams } from '../searchParams';
import { extractErrorMessage, handleServiceError } from '../errorHandling';
import { createPaginationInfo } from '../paginationHelpers';

// Mock dependencies
jest.mock('@/lib/services/EncounterService');
jest.mock('../encounterTransform');
jest.mock('../searchParams');
jest.mock('../errorHandling');
jest.mock('../paginationHelpers');

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;
const mockTransformEncounter = transformEncounter as jest.MockedFunction<typeof transformEncounter>;
const mockBuildSearchParams = buildSearchParams as jest.MockedFunction<typeof buildSearchParams>;
const mockExtractErrorMessage = extractErrorMessage as jest.MockedFunction<typeof extractErrorMessage>;
const mockHandleServiceError = handleServiceError as jest.MockedFunction<typeof handleServiceError>;
const mockCreatePaginationInfo = createPaginationInfo as jest.MockedFunction<typeof createPaginationInfo>;

describe('dataFetchHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processSuccessfulResponse', () => {
    it('should process successful response with encounters', () => {
      const mockData = {
        encounters: [{ id: '1', name: 'Encounter 1' }, { id: '2', name: 'Encounter 2' }],
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
      };

      const mockTransformedEncounters = [
        { id: '1', name: 'Transformed Encounter 1' },
        { id: '2', name: 'Transformed Encounter 2' },
      ];

      const mockPaginationInfo = {
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
      };

      mockTransformEncounter
        .mockReturnValueOnce(mockTransformedEncounters[0] as any)
        .mockReturnValueOnce(mockTransformedEncounters[1] as any);

      mockCreatePaginationInfo.mockReturnValue(mockPaginationInfo);

      const result = processSuccessfulResponse(mockData, 10);

      expect(mockTransformEncounter).toHaveBeenCalledTimes(2);
      expect(mockTransformEncounter).toHaveBeenCalledWith({ id: '1', name: 'Encounter 1' });
      expect(mockTransformEncounter).toHaveBeenCalledWith({ id: '2', name: 'Encounter 2' });

      expect(mockCreatePaginationInfo).toHaveBeenCalledWith(1, 5, 50, 10);

      expect(result).toEqual({
        encounters: mockTransformedEncounters,
        pagination: mockPaginationInfo,
      });
    });

    it('should handle empty encounters array', () => {
      const mockData = {
        encounters: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
      };

      const mockPaginationInfo = {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      };

      mockCreatePaginationInfo.mockReturnValue(mockPaginationInfo);

      const result = processSuccessfulResponse(mockData, 10);

      expect(mockTransformEncounter).not.toHaveBeenCalled();
      expect(result.encounters).toEqual([]);
      expect(result.pagination).toEqual(mockPaginationInfo);
    });
  });

  describe('processErrorResponse', () => {
    it('should extract error message from error object', () => {
      const mockError = new Error('Test error');
      const expectedMessage = 'Extracted error message';

      mockExtractErrorMessage.mockReturnValue(expectedMessage);

      const result = processErrorResponse(mockError);

      expect(mockExtractErrorMessage).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({ errorMessage: expectedMessage });
    });

    it('should handle string errors', () => {
      const mockError = 'String error message';
      const expectedMessage = 'String error message';

      mockExtractErrorMessage.mockReturnValue(expectedMessage);

      const result = processErrorResponse(mockError);

      expect(result).toEqual({ errorMessage: expectedMessage });
    });

    it('should handle null errors', () => {
      const mockError = null;
      const expectedMessage = 'Unknown error occurred';

      mockExtractErrorMessage.mockReturnValue(expectedMessage);

      const result = processErrorResponse(mockError);

      expect(result).toEqual({ errorMessage: expectedMessage });
    });
  });

  describe('fetchEncountersData', () => {
    const mockFilters = { status: [], difficulty: [], tags: [] };
    const mockSearchQuery = 'test';
    const mockSortBy = 'name' as const;
    const mockSortOrder = 'asc' as const;
    const mockCurrentPage = 1;
    const mockLimit = 10;

    it('should successfully fetch encounters data', async () => {
      const mockSearchParams = { search: 'test', page: 1 };
      const mockServiceResult = {
        success: true,
        data: { encounters: [], currentPage: 1, totalPages: 1, totalItems: 0 },
      };

      mockBuildSearchParams.mockReturnValue(mockSearchParams);
      mockEncounterService.searchEncounters.mockResolvedValue(mockServiceResult);

      const result = await fetchEncountersData(
        mockFilters,
        mockSearchQuery,
        mockSortBy,
        mockSortOrder,
        mockCurrentPage,
        mockLimit
      );

      expect(mockBuildSearchParams).toHaveBeenCalledWith(
        mockFilters,
        mockSearchQuery,
        mockSortBy,
        mockSortOrder,
        mockCurrentPage,
        mockLimit
      );
      expect(mockEncounterService.searchEncounters).toHaveBeenCalledWith(mockSearchParams);
      expect(result).toEqual({ success: true, data: mockServiceResult.data });
    });

    it('should handle service failure', async () => {
      const mockSearchParams = { search: 'test', page: 1 };
      const mockServiceResult = { success: false, error: 'Service error' };
      const expectedErrorMessage = 'Handled service error';

      mockBuildSearchParams.mockReturnValue(mockSearchParams);
      mockEncounterService.searchEncounters.mockResolvedValue(mockServiceResult);
      mockHandleServiceError.mockReturnValue(expectedErrorMessage);

      await expect(
        fetchEncountersData(
          mockFilters,
          mockSearchQuery,
          mockSortBy,
          mockSortOrder,
          mockCurrentPage,
          mockLimit
        )
      ).rejects.toThrow(expectedErrorMessage);

      expect(mockHandleServiceError).toHaveBeenCalledWith(mockServiceResult);
    });

    it('should handle service success with no data', async () => {
      const mockSearchParams = { search: 'test', page: 1 };
      const mockServiceResult = { success: true, data: null };
      const expectedErrorMessage = 'No data returned';

      mockBuildSearchParams.mockReturnValue(mockSearchParams);
      mockEncounterService.searchEncounters.mockResolvedValue(mockServiceResult);
      mockHandleServiceError.mockReturnValue(expectedErrorMessage);

      await expect(
        fetchEncountersData(
          mockFilters,
          mockSearchQuery,
          mockSortBy,
          mockSortOrder,
          mockCurrentPage,
          mockLimit
        )
      ).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('createStateUpdaters', () => {
    let mockSetEncounters: jest.Mock;
    let mockSetPagination: jest.Mock;
    let mockSetError: jest.Mock;
    let updaters: ReturnType<typeof createStateUpdaters>;

    beforeEach(() => {
      mockSetEncounters = jest.fn();
      mockSetPagination = jest.fn();
      mockSetError = jest.fn();
      updaters = createStateUpdaters(mockSetEncounters, mockSetPagination, mockSetError);
    });

    describe('updateSuccessState', () => {
      it('should update state with success data', () => {
        const mockEncounters = [{ id: '1', name: 'Test' }] as any;
        const mockPagination = { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 };

        updaters.updateSuccessState(mockEncounters, mockPagination);

        expect(mockSetEncounters).toHaveBeenCalledWith(mockEncounters);
        expect(mockSetPagination).toHaveBeenCalledWith(mockPagination);
        expect(mockSetError).toHaveBeenCalledWith(null);
      });
    });

    describe('updateErrorState', () => {
      it('should update state with error', () => {
        const errorMessage = 'Test error';

        updaters.updateErrorState(errorMessage);

        expect(mockSetError).toHaveBeenCalledWith(errorMessage);
        expect(mockSetEncounters).toHaveBeenCalledWith([]);
        expect(mockSetPagination).toHaveBeenCalledWith(null);
      });
    });

    describe('resetState', () => {
      it('should reset error state', () => {
        updaters.resetState();

        expect(mockSetError).toHaveBeenCalledWith(null);
        expect(mockSetEncounters).not.toHaveBeenCalled();
        expect(mockSetPagination).not.toHaveBeenCalled();
      });
    });
  });
});