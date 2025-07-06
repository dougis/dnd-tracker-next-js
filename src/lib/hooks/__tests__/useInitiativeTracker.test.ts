import { renderHook, act } from '@testing-library/react';
import { useInitiativeTracker } from '../useInitiativeTracker';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

/**
 * @jest-environment jsdom
 */

// Set up DOM environment for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock document methods
document.createElement = jest.fn().mockReturnValue({
  href: '',
  download: '',
  click: jest.fn(),
}) as any;
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('useInitiativeTracker', () => {
  let mockEncounter: any;
  let mockOnEncounterUpdate: jest.Mock;

  beforeEach(() => {
    // Ensure DOM is available
    if (typeof document === 'undefined') {
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.window = dom.window as any;
    }
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
    mockEncounter.combatState.currentTurn = 1;

    // Add participants to match the initiative order
    mockEncounter.participants = [
      {
        characterId: PARTICIPANT_IDS.FIRST,
        name: 'Test Character 1',
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 20,
        temporaryHitPoints: 0,
        armorClass: 15,
        initiative: 20,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: []
      },
      {
        characterId: PARTICIPANT_IDS.SECOND,
        name: 'Test Character 2',
        type: 'NPC',
        maxHitPoints: 20,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        armorClass: 14,
        initiative: 15,
        isPlayer: false,
        isVisible: true,
        notes: '',
        conditions: []
      }
    ];

    mockOnEncounterUpdate = jest.fn();

    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
    (navigator.clipboard.writeText as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useInitiativeTracker({
      encounter: mockEncounter,
      onEncounterUpdate: mockOnEncounterUpdate
    }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  describe('handleNextTurn', () => {
    it('makes API call to next-turn endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

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

    it('calls onEncounterUpdate on successful API response', async () => {
      const updatedEncounter = { ...mockEncounter, combatState: { ...mockEncounter.combatState, currentTurn: 2 } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: updatedEncounter })
      });

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      await act(async () => {
        await result.current.handleNextTurn();
      });

      expect(mockOnEncounterUpdate).toHaveBeenCalledWith(updatedEncounter);
    });
  });

  describe('handlePreviousTurn', () => {
    it('makes API call to previous-turn endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

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
  });

  describe('handlePauseCombat', () => {
    it('makes API call to pause endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      await act(async () => {
        await result.current.handlePauseCombat();
      });

      expect(fetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounter._id}/combat/pause`,
        expect.objectContaining({
          method: 'PATCH'
        })
      );
    });
  });

  describe('handleEditInitiative', () => {
    it('makes API call with participant ID and new initiative', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

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

  describe('error handling', () => {
    it('sets error state when API call fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Combat action failed' })
      });

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      await act(async () => {
        try {
          await result.current.handleNextTurn();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Combat action failed');
    });

    it('sets loading state during API calls', async () => {
      let resolvePromise: (_value: any) => void;
      const pendingPromise = new Promise((_value: any) => {
        resolvePromise = _value;
      });

      (fetch as jest.Mock).mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      act(() => {
        result.current.handleNextTurn();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ success: true, encounter: mockEncounter })
        });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleExportInitiative', () => {
    it('creates and downloads JSON file with initiative data', () => {
      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      act(() => {
        result.current.handleExportInitiative();
      });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('sets error when combat is not active', () => {
      mockEncounter.combatState.isActive = false;

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      act(() => {
        result.current.handleExportInitiative();
      });

      expect(result.current.error).toBe('Combat must be active to export initiative data');
    });
  });

  describe('handleShareInitiative', () => {
    it('copies initiative data to clipboard when navigator.share is not available', () => {
      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      act(() => {
        result.current.handleShareInitiative();
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(`Initiative Order - ${mockEncounter.name}`)
      );
    });

    it('sets error when combat is not active', () => {
      mockEncounter.combatState.isActive = false;

      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      act(() => {
        result.current.handleShareInitiative();
      });

      expect(result.current.error).toBe('Combat must be active to share initiative data');
    });

    it('includes active turn indicator in shared text', () => {
      const { result } = renderHook(() => useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      }));

      act(() => {
        result.current.handleShareInitiative();
      });

      const callArg = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain('→'); // Active turn indicator
    });
  });
});