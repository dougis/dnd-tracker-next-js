/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useEditableContent } from '../useEditableContent';
import {
  createMockResponse,
  createDelayedMockResponse,
  withConsoleSpy,
  waitForAsyncOperation,
  expectApiCall,
  testAsyncError,
  expectHookState
} from './test-utils';

describe('useEditableContent', () => {
  const initialValue = 'Initial content';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      expectHookState(result, {
        editedValue: initialValue,
        isSaving: false
      });
      expect(typeof result.current.handleSave).toBe('function');
      expect(typeof result.current.handleCancel).toBe('function');
      expect(typeof result.current.handleChange).toBe('function');
    });

    it('initializes with empty string when no initial value provided', () => {
      const { result } = renderHook(() => useEditableContent(''));

      expectHookState(result, {
        editedValue: '',
        isSaving: false
      });
    });
  });

  describe('handleChange', () => {
    it('updates the edited value', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      act(() => {
        result.current.handleChange('New content');
      });

      expect(result.current.editedValue).toBe('New content');
    });
  });

  describe('handleCancel', () => {
    it('resets edited value to initial value', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      // Change the value
      act(() => {
        result.current.handleChange('Modified content');
      });

      expect(result.current.editedValue).toBe('Modified content');

      // Cancel changes
      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.editedValue).toBe(initialValue);
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

      // Start save operation
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      // Wait for save to complete
      await waitForAsyncOperation();

      expect(result.current.isSaving).toBe(false);
    });

    it('handles save errors gracefully', withConsoleSpy(async (consoleSpy) => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const { result } = renderHook(() =>
        useEditableContent(initialValue, mockOnSave)
      );

      await act(async () => {
        await testAsyncError(
          () => result.current.handleSave(),
          'Save failed',
          consoleSpy
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save content:',
        expect.any(Error)
      );
      expect(result.current.isSaving).toBe(false);
    }));
  });

  describe('handleSave without onSave callback', () => {
    it('should make API call to save content when no onSave callback provided', async () => {
      global.fetch = jest.fn().mockResolvedValue(createMockResponse(true));

      const { result } = renderHook(() => useEditableContent(initialValue));

      act(() => {
        result.current.handleChange('Updated content');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expectApiCall('PUT', '/api/content', { content: 'Updated content' });

      (fetch as jest.Mock).mockClear();
    });

    it('should handle API errors when saving without callback', withConsoleSpy(async (consoleSpy) => {
      global.fetch = jest.fn().mockResolvedValue(createMockResponse(false, null, 500));
      const { result } = renderHook(() => useEditableContent(initialValue));

      await act(async () => {
        await testAsyncError(
          () => result.current.handleSave(),
          'Failed to save content: 500',
          consoleSpy
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save content:',
        expect.any(Error)
      );

      (fetch as jest.Mock).mockClear();
    }));

    it('should set isSaving state during API call', async () => {
      global.fetch = createDelayedMockResponse(true);
      const { result } = renderHook(() => useEditableContent(initialValue));

      // Start save operation
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      // Wait for save to complete
      await waitForAsyncOperation();

      expect(result.current.isSaving).toBe(false);

      (fetch as jest.Mock).mockClear();
    });

    it('should handle network errors when making API call', withConsoleSpy(async (consoleSpy) => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useEditableContent(initialValue));

      await act(async () => {
        await testAsyncError(
          () => result.current.handleSave(),
          'Network error',
          consoleSpy
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save content:',
        expect.any(Error)
      );

      (fetch as jest.Mock).mockClear();
    }));
  });

  describe('edge cases', () => {
    it('should handle multiple consecutive save calls', async () => {
      global.fetch = createDelayedMockResponse(true, 50);
      const { result } = renderHook(() => useEditableContent(initialValue));

      // Start first save
      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      // Try to start second save while first is in progress
      act(() => {
        result.current.handleSave();
      });

      // Should still be saving
      expect(result.current.isSaving).toBe(true);

      // Wait for operations to complete
      await waitForAsyncOperation(100);

      expect(result.current.isSaving).toBe(false);

      (fetch as jest.Mock).mockClear();
    });

    it('should handle changes during save operation', async () => {
      global.fetch = createDelayedMockResponse(true, 50);
      const { result } = renderHook(() => useEditableContent(initialValue));

      // Start save
      act(() => {
        result.current.handleSave();
      });

      // Change value while saving
      act(() => {
        result.current.handleChange('Changed during save');
      });

      expect(result.current.editedValue).toBe('Changed during save');

      // Wait for save to complete
      await waitForAsyncOperation(100);

      (fetch as jest.Mock).mockClear();
    });
  });
});