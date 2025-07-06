/**
 * @jest-environment jsdom
 */
import { useInitiativeTracker } from '../useInitiativeTracker';
import { act, renderHook } from '@testing-library/react';
import {
  createEncounterForHookTesting,
  setupDOMMocks,
  resetDOMMocks,
  setupSuccessfulFetchMock,
  createInitiativeTrackerProps
} from '@/components/combat/utils/__tests__/__test-helpers__/combatTestHelpers';

// Mock fetch
global.fetch = jest.fn();

describe('useInitiativeTracker', () => {
  let mockEncounter: any;
  let mockOnEncounterUpdate: jest.Mock;

  beforeEach(() => {
    mockEncounter = createEncounterForHookTesting();
    mockOnEncounterUpdate = jest.fn();
    setupDOMMocks();

    // Setup DOM container for testing
    document.body.innerHTML = '<div id="test-container"></div>';

    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    resetDOMMocks();
    document.body.innerHTML = '';
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() =>
      useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.handleNextTurn).toBe('function');
    expect(typeof result.current.handlePreviousTurn).toBe('function');
    expect(typeof result.current.handlePauseCombat).toBe('function');
    expect(typeof result.current.handleResumeCombat).toBe('function');
    expect(typeof result.current.handleEditInitiative).toBe('function');
    expect(typeof result.current.handleDelayAction).toBe('function');
    expect(typeof result.current.handleReadyAction).toBe('function');
    expect(typeof result.current.handleExportInitiative).toBe('function');
    expect(typeof result.current.handleShareInitiative).toBe('function');
  });

  describe('API call handlers', () => {
    it('handleNextTurn makes API call to next-turn endpoint', async () => {
      setupSuccessfulFetchMock(mockEncounter);
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      await act(async () => {
        await result.current.handleNextTurn();
      });

      expect(fetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounter._id}/combat/next-turn`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('handlePreviousTurn makes API call to previous-turn endpoint', async () => {
      setupSuccessfulFetchMock(mockEncounter);
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      await act(async () => {
        await result.current.handlePreviousTurn();
      });

      expect(fetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounter._id}/combat/previous-turn`,
        expect.objectContaining({
          method: 'PATCH'
        })
      );
    });

    it('handleEditInitiative makes API call with participant ID and new initiative', async () => {
      setupSuccessfulFetchMock(mockEncounter);
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      const participantId = 'participant-123';
      const newInitiative = 15;

      await act(async () => {
        await result.current.handleEditInitiative(participantId, newInitiative);
      });

      expect(fetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounter._id}/combat/initiative`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            participantId,
            initiative: newInitiative
          })
        })
      );
    });
  });

  describe('export and share functionality', () => {
    it('handleExportInitiative creates download link when combat is active', () => {
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      act(() => {
        result.current.handleExportInitiative();
      });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('handleExportInitiative sets error when combat is not active', () => {
      mockEncounter.combatState.isActive = false;
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      act(() => {
        result.current.handleExportInitiative();
      });

      expect(result.current.error).toBe('Combat must be active to export initiative data');
    });

    it('handleShareInitiative copies data to clipboard when navigator.share is not available', () => {
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      act(() => {
        result.current.handleShareInitiative();
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(`Initiative Order - ${mockEncounter.name}`)
      );
    });

    it('handleShareInitiative sets error when combat is not active', () => {
      mockEncounter.combatState.isActive = false;
      const { result } = renderHook(() =>
        useInitiativeTracker(createInitiativeTrackerProps(mockEncounter, mockOnEncounterUpdate))
      );

      act(() => {
        result.current.handleShareInitiative();
      });

      expect(result.current.error).toBe('Combat must be active to share initiative data');
    });
  });
});