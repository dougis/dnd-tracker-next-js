/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCollaborators } from '../useCollaborators';

// Mock fetch
global.fetch = jest.fn();

describe('useCollaborators', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useCollaborators());

      expect(result.current.newCollaboratorEmail).toBe('');
      expect(result.current.showAddCollaborator).toBe(false);
      expect(typeof result.current.setNewCollaboratorEmail).toBe('function');
      expect(typeof result.current.handleToggleAdd).toBe('function');
      expect(typeof result.current.handleAddCollaborator).toBe('function');
      expect(typeof result.current.handleRemoveCollaborator).toBe('function');
    });
  });

  describe('handleToggleAdd', () => {
    it('toggles showAddCollaborator from false to true', () => {
      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.handleToggleAdd();
      });

      expect(result.current.showAddCollaborator).toBe(true);
    });

    it('toggles showAddCollaborator from true to false and clears email', () => {
      const { result } = renderHook(() => useCollaborators());

      // Set initial state
      act(() => {
        result.current.setNewCollaboratorEmail('test@example.com');
        result.current.handleToggleAdd(); // Show add form
      });

      expect(result.current.showAddCollaborator).toBe(true);
      expect(result.current.newCollaboratorEmail).toBe('test@example.com');

      // Toggle off
      act(() => {
        result.current.handleToggleAdd();
      });

      expect(result.current.showAddCollaborator).toBe(false);
      expect(result.current.newCollaboratorEmail).toBe('');
    });
  });

  describe('handleAddCollaborator', () => {
    it('should make API call to add collaborator when email is provided', async () => {
      const mockResponse = { ok: true, json: async () => ({ success: true }) };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCollaborators());

      // Set email
      act(() => {
        result.current.setNewCollaboratorEmail('test@example.com');
      });

      // Add collaborator
      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expect(fetch).toHaveBeenCalledWith('/api/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      // Should return true on success
      expect(addResult!).toBe(true);
      // Should reset state after successful addition
      expect(result.current.newCollaboratorEmail).toBe('');
      expect(result.current.showAddCollaborator).toBe(false);
    });

    it('should not make API call when email is empty', async () => {
      const { result } = renderHook(() => useCollaborators());

      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expect(fetch).not.toHaveBeenCalled();
      // Should return false when no email provided
      expect(addResult!).toBe(false);
    });

    it('should not make API call when email is only whitespace', async () => {
      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail('   ');
      });

      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expect(fetch).not.toHaveBeenCalled();
      // Should return false when only whitespace provided
      expect(addResult!).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = { ok: false, status: 400 };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail('test@example.com');
      });

      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to add collaborator:',
        expect.any(Error)
      );
      // Should return false on error
      expect(addResult!).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('handleRemoveCollaborator', () => {
    it('should make API call to remove collaborator', async () => {
      const mockResponse = { ok: true, json: async () => ({ success: true }) };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCollaborators());

      let removeResult: boolean;
      await act(async () => {
        removeResult = await result.current.handleRemoveCollaborator('collaborator-123');
      });

      expect(fetch).toHaveBeenCalledWith('/api/collaborators/collaborator-123', {
        method: 'DELETE',
      });
      // Should return true on success
      expect(removeResult!).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = { ok: false, status: 404 };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useCollaborators());

      let removeResult: boolean;
      await act(async () => {
        removeResult = await result.current.handleRemoveCollaborator('collaborator-123');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to remove collaborator:',
        expect.any(Error)
      );
      // Should return false on error
      expect(removeResult!).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});