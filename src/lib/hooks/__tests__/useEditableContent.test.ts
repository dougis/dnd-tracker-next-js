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
  setupFetchMock,
  cleanupFetchMock,
  testApiErrorWithConsole,
  createDelayedOperation,
} from './test-utils';

describe('useEditableContent', () => {

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
      const mockOnSave = jest.fn().mockImplementation(createDelayedOperation());
      const { result } = renderHook(() =>
        useEditableContent(TEST_CONTENT, mockOnSave)
      );

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('handles save errors gracefully', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const { result } = renderHook(() =>
        useEditableContent(TEST_CONTENT, mockOnSave)
      );

      await act(async () => {
        await testApiErrorWithConsole(
          () => result.current.handleSave(),
          'Failed to save content:'
        );
      });
      
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('handleSave without onSave callback', () => {
    it('should make API call to save content when no onSave callback provided', async () => {
      setupFetchMock(createMockResponse());
      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      act(() => {
        result.current.handleChange('Updated content');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expectApiCall('PUT', '/api/content', { content: 'Updated content' });
      cleanupFetchMock();
    });

    it('should handle API errors when saving without callback', async () => {
      setupFetchMock(createMockResponse(false));
      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      await act(async () => {
        await testApiErrorWithConsole(
          () => result.current.handleSave(),
          'Failed to save content:'
        );
      });

      cleanupFetchMock();
    });

    it('should set isSaving state during API call', async () => {
      setupFetchMock();
      (fetch as jest.Mock).mockImplementation(() => createDelayedMockResponse(100));
      const { result } = renderHook(() => useEditableContent(TEST_CONTENT));

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSaving).toBe(false);
      cleanupFetchMock();
    });
  });
});