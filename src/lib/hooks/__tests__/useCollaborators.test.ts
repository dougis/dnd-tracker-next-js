/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCollaborators } from '../useCollaborators';
import {
  TEST_EMAIL,
  TEST_ID,
  createMockResponse,
  expectHookState,
  expectFunctionType,
  setupFetchMock,
  cleanupFetchMock,
  testApiErrorWithConsole,
  testSuccessfulOperation,
  testNoApiCall,
} from './test-utils';

describe('useCollaborators', () => {
  beforeEach(() => {
    setupFetchMock();
  });

  afterEach(() => {
    cleanupFetchMock();
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
      setupFetchMock(createMockResponse());
      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
      });

      await testSuccessfulOperation(
        result,
        () => result.current.handleAddCollaborator(),
        'POST',
        '/api/collaborators',
        { email: TEST_EMAIL },
        {
          newCollaboratorEmail: '',
          showAddCollaborator: false,
        }
      );
    });

    it('should not make API call when email is empty', async () => {
      const { result } = renderHook(() => useCollaborators());

      await testNoApiCall(result, () => result.current.handleAddCollaborator());
    });

    it('should not make API call when email is only whitespace', async () => {
      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail('   ');
      });

      await testNoApiCall(result, () => result.current.handleAddCollaborator());
    });

    it('should handle API errors gracefully', async () => {
      setupFetchMock(createMockResponse(false));
      const { result } = renderHook(() => useCollaborators());

      act(() => {
        result.current.setNewCollaboratorEmail(TEST_EMAIL);
      });

      await act(async () => {
        await testApiErrorWithConsole(
          () => result.current.handleAddCollaborator(),
          'Failed to add collaborator:',
          false
        );
      });
    });
  });

  describe('handleRemoveCollaborator', () => {
    it('should make API call to remove collaborator', async () => {
      setupFetchMock(createMockResponse());
      const { result } = renderHook(() => useCollaborators());

      await testSuccessfulOperation(
        result,
        () => result.current.handleRemoveCollaborator(TEST_ID),
        'DELETE',
        `/api/collaborators/${TEST_ID}`
      );
    });

    it('should handle API errors gracefully', async () => {
      setupFetchMock(createMockResponse(false));
      const { result } = renderHook(() => useCollaborators());

      await act(async () => {
        await testApiErrorWithConsole(
          () => result.current.handleRemoveCollaborator(TEST_ID),
          'Failed to remove collaborator:',
          false
        );
      });
    });
  });
});