import { renderHook, act } from '@testing-library/react';
import { useCharacterSubmit } from '../../hooks/useCharacterSubmit';
import { CharacterService } from '@/lib/services/CharacterService';
import {
  createMockProps,
  mockCharacterData,
  mockSuccessResult,
  mockErrorResult,
  expectInitialFormState
} from '../test-helpers';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService');
const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

describe('useCharacterSubmit', () => {
  const defaultProps = createMockProps();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      const { result } = renderHook(() => useCharacterSubmit(defaultProps));
      expectInitialFormState(result);
    });

    it('works without optional callbacks', () => {
      const { result } = renderHook(() => useCharacterSubmit({ ownerId: 'user123' }));

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(typeof result.current.submitCharacter).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Successful Submission', () => {
    it('handles successful character creation', async () => {
      mockCharacterService.createCharacter.mockResolvedValue(mockSuccessResult);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(mockCharacterService.createCharacter).toHaveBeenCalledWith('user123', mockCharacterData);
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockSuccessResult.data);
      expect(defaultProps.onError).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
    });

    it('sets isSubmitting to true during submission', async () => {
      let resolvePromise: (_value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockCharacterService.createCharacter.mockReturnValue(promise);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      act(() => {
        result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolvePromise({ success: true, data: {} });
        await promise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('clears previous errors on new submission', async () => {
      // First, create an error state
      mockCharacterService.createCharacter.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid data',
        },
      });

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).not.toBe(null);

      // Now submit again with success
      mockCharacterService.createCharacter.mockResolvedValue({
        success: true,
        data: { id: 'char123' },
      });

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).toBe(null);
    });
  });

  describe('Failed Submission', () => {
    it('handles service error response', async () => {
      mockCharacterService.createCharacter.mockResolvedValue(mockErrorResult);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(mockCharacterService.createCharacter).toHaveBeenCalledWith('user123', mockCharacterData);
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onError).toHaveBeenCalledWith(mockErrorResult.error);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toEqual(mockErrorResult.error);
    });

    it('handles service error with non-string details', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character validation failed',
          details: { field: 'name', message: 'Required' },
        },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockError);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Character validation failed',
        details: undefined,
      });
    });

    it('handles network/unexpected errors', async () => {
      const networkError = new Error('Network connection failed');
      mockCharacterService.createCharacter.mockRejectedValue(networkError);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onError).toHaveBeenCalledWith({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        details: 'Network connection failed',
      });
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        details: 'Network connection failed',
      });
    });

    it('handles non-Error thrown values', async () => {
      const stringError = 'Something went wrong';
      mockCharacterService.createCharacter.mockRejectedValue(stringError);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        details: 'Unknown error',
      });
    });
  });

  describe('Error Management', () => {
    it('clears errors when clearError is called', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character validation failed',
        },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockError);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).not.toBe(null);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.submitError).toBe(null);
    });

    it('maintains error state until manually cleared', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character validation failed',
        },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockError);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      const errorState = result.current.submitError;
      expect(errorState).not.toBe(null);

      // Error should persist across rerenders
      expect(result.current.submitError).toBe(errorState);
    });
  });

  describe('Hook Behavior Without Callbacks', () => {
    it('works correctly when onSuccess is not provided', async () => {
      const mockResult = {
        success: true,
        data: { id: 'char123' },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useCharacterSubmit({
        ownerId: 'user123',
        onError: defaultProps.onError,
      }));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(defaultProps.onError).not.toHaveBeenCalled();
    });

    it('works correctly when onError is not provided', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character validation failed',
        },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockError);

      const { result } = renderHook(() => useCharacterSubmit({
        ownerId: 'user123',
        onSuccess: defaultProps.onSuccess,
      }));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).not.toBe(null);
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });

    it('works correctly when neither callback is provided', async () => {
      const mockResult = {
        success: true,
        data: { id: 'char123' },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useCharacterSubmit({
        ownerId: 'user123',
      }));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
    });
  });

  describe('Multiple Submissions', () => {
    it('handles multiple sequential submissions correctly', async () => {
      const mockResult1 = {
        success: true,
        data: { id: 'char123' },
      };
      const mockResult2 = {
        success: true,
        data: { id: 'char456' },
      };

      mockCharacterService.createCharacter
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSuccess).toHaveBeenLastCalledWith(mockResult1.data);

      await act(async () => {
        await result.current.submitCharacter({ ...mockCharacterData, name: 'Second Character' });
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(2);
      expect(defaultProps.onSuccess).toHaveBeenLastCalledWith(mockResult2.data);
      expect(mockCharacterService.createCharacter).toHaveBeenCalledTimes(2);
    });

    it('handles submission after error correctly', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character validation failed',
        },
      };
      const mockSuccess = {
        success: true,
        data: { id: 'char123' },
      };

      mockCharacterService.createCharacter
        .mockResolvedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      // First submission fails
      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).not.toBe(null);
      expect(defaultProps.onError).toHaveBeenCalledTimes(1);

      // Second submission succeeds
      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).toBe(null);
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty character data gracefully', async () => {
      const mockResult = {
        success: true,
        data: { id: 'char123' },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter({} as any);
      });

      expect(mockCharacterService.createCharacter).toHaveBeenCalledWith('user123', {});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('handles undefined error details', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character validation failed',
          details: undefined,
        },
      };
      mockCharacterService.createCharacter.mockResolvedValue(mockError);

      const { result } = renderHook(() => useCharacterSubmit(defaultProps));

      await act(async () => {
        await result.current.submitCharacter(mockCharacterData);
      });

      expect(result.current.submitError).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Character validation failed',
        details: undefined,
      });
    });
  });
});