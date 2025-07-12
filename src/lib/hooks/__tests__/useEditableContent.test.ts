/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useEditableContent } from '../useEditableContent';
import {
  TEST_CONTENT,
  createMockResponse,
  createDelayedMockResponse,
  expectApiCall,
  expectHookState,
  expectFunctionType,
  testAsyncError,
} from './test-utils';

describe('useEditableContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      expectHookState(result, {
        editedValue: TEST_CONTENT,
        isSaving: false,
      });

      ['handleSave', 'handleCancel', 'handleChange']
        .forEach(funcName => expectFunctionType(result.current, funcName));
    });
  });

  describe('handleChange', () => {
    it('updates the edited value', () => {
      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      act(() => {
        result.current.handleChange('New content');
      });

      expect(result.current.editedValue).toBe('New content');
    });
  });

  describe('handleCancel', () => {
    it('resets edited value to initial value', () => {
      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      // Change the value
      act(() => {
        result.current.handleChange('Modified content');
      });

      expect(result.current.editedValue).toBe('Modified content');

      // Cancel changes
      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.editedValue).toBe(TEST_CONTENT);
    });
  });

  describe('handleSave with onSave callback', () => {
    it('calls onSave callback with current edited value', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableContent(TEST_CONTENT, mockOnSave)
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
        useEditableContent(TEST_CONTENT, mockOnSave)
      );

      // Start save operation
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      // Wait for save to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('handles save errors gracefully', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() =>
        useEditableContent(TEST_CONTENT, mockOnSave)
      );

      await act(async () => {
        await testAsyncError(
          () => result.current.handleSave(),
          'Save failed'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save content:',
        expect.any(Error)
      );
      expect(result.current.isSaving).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('handleSave without onSave callback', () => {
    it('should make API call to save content when no onSave callback provided', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue(createMockResponse());

      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      act(() => {
        result.current.handleChange('Updated content');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expectApiCall('PUT', '/api/content', { content: 'Updated content' });

      // Clean up
      (fetch as jest.Mock).mockClear();
    });

    it('should handle API errors when saving without callback', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn().mockResolvedValue(createMockResponse(false));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      await act(async () => {
        await testAsyncError(
          () => result.current.handleSave(),
          'Failed to save content: 400'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save content:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      (fetch as jest.Mock).mockClear();
    });

    it('should set isSaving state during API call', async () => {
      // Mock fetch with delay
      global.fetch = jest.fn().mockImplementation(
        () => createDelayedMockResponse(100)
      );

      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      // Start save operation
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      // Wait for save to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSaving).toBe(false);

      // Clean up
      (fetch as jest.Mock).mockClear();
    });
  });
});