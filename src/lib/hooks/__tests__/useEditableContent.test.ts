/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useEditableContent } from '../useEditableContent';
import {
  createMockResponse,
  createMockErrorResponse,
  setupConsoleSpy,
  restoreConsoleSpy,
  mockFetch,
  mockFetchWithDelay,
  clearFetchMock,
  expectFunctionTypes,
  expectApiCall,
  expectConsoleError,
  testAsyncOperation,
  testStateChange,
  testLoadingState,
  TEST_CONTENT
} from './hookTestUtils';

describe('useEditableContent', () => {
  const initialValue = TEST_CONTENT;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      expect(result.current.editedValue).toBe(initialValue);
      expect(result.current.isSaving).toBe(false);
      expectFunctionTypes(result.current, ['handleSave', 'handleCancel', 'handleChange']);
    });
  });

  describe('handleChange', () => {
    it('updates the edited value', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      testStateChange(
        result,
        'editedValue',
        initialValue,
        'New content',
        () => result.current.handleChange('New content')
      );
    });
  });

  describe('handleCancel', () => {
    it('resets edited value to initial value', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      // Change the value
      testStateChange(
        result,
        'editedValue',
        initialValue,
        'Modified content',
        () => result.current.handleChange('Modified content')
      );

      // Cancel changes
      testStateChange(
        result,
        'editedValue',
        'Modified content',
        initialValue,
        () => result.current.handleCancel()
      );
    });
  });

  describe('handleSave with onSave callback', () => {
    it('calls onSave callback with current edited value', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableContent(initialValue, mockOnSave)
      );

      act(() => {
        result.current.handleChange('Updated content');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockOnSave).toHaveBeenCalledWith('Updated content');
    });

    it('sets isSaving to true during save operation', async () => {
      const mockOnSave = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      const { result } = renderHook(() =>
        useEditableContent(initialValue, mockOnSave)
      );

      await testLoadingState(
        result,
        () => result.current.handleSave(),
        'isSaving'
      );
    });

    it('handles save errors gracefully', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const consoleSpy = setupConsoleSpy();

      const { result } = renderHook(() =>
        useEditableContent(initialValue, mockOnSave)
      );

      await act(async () => {
        try {
          await result.current.handleSave();
        } catch (error) {
          // Expected to re-throw the error now
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Save failed');
        }
      });

      expectConsoleError(consoleSpy, 'Failed to save content:');
      expect(result.current.isSaving).toBe(false);

      restoreConsoleSpy(consoleSpy);
    });
  });

  describe('handleSave without onSave callback', () => {
    it('should make API call to save content when no onSave callback provided', async () => {
      mockFetch(createMockResponse());

      const { result } = renderHook(() => useEditableContent(initialValue));

      act(() => {
        result.current.handleChange('Updated content');
      });

      await testAsyncOperation(async () => {
        await result.current.handleSave();
      });

      expectApiCall('/api/content', 'PUT', { content: 'Updated content' });

      clearFetchMock();
    });

    it('should handle API errors when saving without callback', async () => {
      mockFetch(createMockErrorResponse(500));
      const consoleSpy = setupConsoleSpy();

      const { result } = renderHook(() => useEditableContent(initialValue));

      await act(async () => {
        try {
          await result.current.handleSave();
        } catch (error) {
          // Expected to re-throw the error now
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Failed to save content: 500');
        }
      });

      expectConsoleError(consoleSpy, 'Failed to save content:');

      restoreConsoleSpy(consoleSpy);
      clearFetchMock();
    });

    it('should set isSaving state during API call', async () => {
      mockFetchWithDelay(createMockResponse(), 100);

      const { result } = renderHook(() => useEditableContent(initialValue));

      await testLoadingState(
        result,
        () => result.current.handleSave(),
        'isSaving'
      );

      clearFetchMock();
    });
  });
});