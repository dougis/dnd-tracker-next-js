/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCollaborators } from '../useCollaborators';
import {
  TEST_EMAIL,
  TEST_ID,
  createMockResponse,
  expectApiCall,
  expectHookState,
  expectFunctionType,
} from './test-utils';

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

      expectHookState(result, {
        newCollaboratorEmail: '',
        showAddCollaborator: false,
      });

      ['setNewCollaboratorEmail', 'handleToggleAdd', 'handleAddCollaborator', 'handleRemoveCollaborator']
        .forEach(funcName => expectFunctionType(result.current, funcName));
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
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
        result.current.handleToggleAdd(); // Show add form
      });

      expectHookState(result, {
        showAddCollaborator: true,
        newCollaboratorEmail: TEST_EMAIL,
      });

      // Toggle off
      act(() => {
        result.current.handleToggleAdd();
      });

      expectHookState(result, {
        showAddCollaborator: false,
        newCollaboratorEmail: '',
      });
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
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expectApiCall('POST', '/api/collaborators', { email: TEST_EMAIL });
      expect(addResult!).toBe(true);
      expectHookState(result, {
        newCollaboratorEmail: '',
        showAddCollaborator: false,
      });
    });

    it('should not make API call when email is empty', async () => {
      const { result } = renderHook(() => useCollaborators());

      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expect(fetch).not.toHaveBeenCalled();
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
      expect(addResult!).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce(createMockResponse(false));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
      });

      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.handleAddCollaborator();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to add collaborator:',
        expect.any(Error)
      );
      expect(addResult!).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('handleRemoveCollaborator', () => {
    it('should make API call to remove collaborator', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce(createMockResponse());
      const { result } = renderHook(() => useCollaborators());

      let removeResult: boolean;
      await act(async () => {
        removeResult = await result.current.handleRemoveCollaborator(TEST_ID);
      });

      expectApiCall('DELETE', `/api/collaborators/${TEST_ID}`);
      expect(removeResult!).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce(createMockResponse(false));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useCollaborators());

      let removeResult: boolean;
      await act(async () => {
        removeResult = await result.current.handleRemoveCollaborator(TEST_ID);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to remove collaborator:',
        expect.any(Error)
      );
      expect(removeResult!).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});