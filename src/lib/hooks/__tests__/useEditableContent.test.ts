/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useEditableContent } from '../useEditableContent';

describe('useEditableContent', () => {
  const initialValue = 'Initial content';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useEditableContent(initialValue));

      expect(result.current.editedValue).toBe(initialValue);
      expect(result.current.isSaving).toBe(false);
      expect(typeof result.current.handleSave).toBe('function');
      expect(typeof result.current.handleCancel).toBe('function');
      expect(typeof result.current.handleChange).toBe('function');
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
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('handles save errors gracefully', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

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
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useEditableContent(initialValue));

      act(() => {
        result.current.handleChange('Updated content');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(fetch).toHaveBeenCalledWith('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Updated content',
        }),
      });

      // Clean up
      (fetch as jest.Mock).mockClear();
    });

    it('should handle API errors when saving without callback', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

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
        () => new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true }),
          }), 100)
        )
      );

      const { result } = renderHook(() => useEditableContent(initialValue));

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