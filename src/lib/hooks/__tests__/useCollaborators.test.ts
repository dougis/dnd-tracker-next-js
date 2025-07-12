/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCollaborators } from '../useCollaborators';
import {
  createMockResponse,
  createMockErrorResponse,
  setupConsoleSpy,
  restoreConsoleSpy,
  clearFetchMock,
  expectFunctionTypes,
  expectApiCall,
  expectConsoleError,
  testAsyncOperation,
  testStateChange,
  TEST_EMAIL,
  TEST_ID
} from './hookTestUtils';

// Mock fetch
global.fetch = jest.fn();

describe('useCollaborators', () => {
  beforeEach(() => {
    clearFetchMock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useCollaborators());

      expect(result.current.newCollaboratorEmail).toBe('');
      expect(result.current.showAddCollaborator).toBe(false);
      expectFunctionTypes(result.current, [
        'setNewCollaboratorEmail',
        'handleToggleAdd',
        'handleAddCollaborator',
        'handleRemoveCollaborator'
      ]);
    });
  });

  describe('handleToggleAdd', () => {
    it('toggles showAddCollaborator from false to true', () => {
      const { result } = renderHook(() => useCollaborators());

      testStateChange(
        result,
        'showAddCollaborator',
        false,
        true,
        () => result.current.handleToggleAdd()
      );
    });

    it('toggles showAddCollaborator from true to false and clears email', () => {
      const { result } = renderHook(() => useCollaborators());

      // Set initial state
      act(() => {
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
        result.current.handleToggleAdd(); // Show add form
      });

      expect(result.current.showAddCollaborator).toBe(true);
      expect(result.current.newCollaboratorEmail).toBe(TEST_EMAIL);

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
      (fetch as jest.Mock).mockResolvedValueOnce(createMockResponse());

      const { result } = renderHook(() => useCollaborators());

      // Set email
      act(() => {
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
      });

      // Add collaborator
      let addResult: boolean;
      await testAsyncOperation(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expectApiCall('/api/collaborators', 'POST', { email: TEST_EMAIL });

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
      (fetch as jest.Mock).mockResolvedValueOnce(createMockErrorResponse(400));
      const consoleSpy = setupConsoleSpy();

      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
      });

      let addResult: boolean;
      await testAsyncOperation(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expectConsoleError(consoleSpy, 'Failed to add collaborator:');
      // Should return false on error
      expect(addResult!).toBe(false);

      restoreConsoleSpy(consoleSpy);
    });
  });

  describe('handleRemoveCollaborator', () => {
    it('should make API call to remove collaborator', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce(createMockResponse());

      const { result } = renderHook(() => useCollaborators());

      let removeResult: boolean;
      await testAsyncOperation(async () => {
        removeResult = await result.current.handleRemoveCollaborator(TEST_ID);
      });

      expect(fetch).toHaveBeenCalledWith(`/api/collaborators/${TEST_ID}`, {
        method: 'DELETE',
      });
      // Should return true on success
      expect(removeResult!).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce(createMockErrorResponse(404));
      const consoleSpy = setupConsoleSpy();

      const { result } = renderHook(() => useCollaborators());

      let removeResult: boolean;
      await testAsyncOperation(async () => {
        removeResult = await result.current.handleRemoveCollaborator(TEST_ID);
      });

      expectConsoleError(consoleSpy, 'Failed to remove collaborator:');
      // Should return false on error
      expect(removeResult!).toBe(false);

      restoreConsoleSpy(consoleSpy);
    });
  });
});