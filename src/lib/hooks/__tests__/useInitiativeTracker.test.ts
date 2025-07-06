/**
 * @jest-environment jsdom
 */
import { useInitiativeTracker } from '../useInitiativeTracker';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import { act } from '@testing-library/react';

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
    const handlers = useInitiativeTracker({
      encounter: mockEncounter,
      onEncounterUpdate: mockOnEncounterUpdate
    });

    expect(handlers.isLoading).toBe(false);
    expect(handlers.error).toBe(null);
    expect(typeof handlers.handleNextTurn).toBe('function');
    expect(typeof handlers.handlePreviousTurn).toBe('function');
    expect(typeof handlers.handlePauseCombat).toBe('function');
    expect(typeof handlers.handleResumeCombat).toBe('function');
    expect(typeof handlers.handleEditInitiative).toBe('function');
    expect(typeof handlers.handleDelayAction).toBe('function');
    expect(typeof handlers.handleReadyAction).toBe('function');
    expect(typeof handlers.handleExportInitiative).toBe('function');
    expect(typeof handlers.handleShareInitiative).toBe('function');
  });

  describe('API call handlers', () => {
    it('handleNextTurn makes API call to next-turn endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      await act(async () => {
        await handlers.handleNextTurn();
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
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      await act(async () => {
        await handlers.handlePreviousTurn();
      });

      expect(fetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounter._id}/combat/previous-turn`,
        expect.objectContaining({
          method: 'PATCH'
        })
      );
    });

    it('handleEditInitiative makes API call with participant ID and new initiative', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, encounter: mockEncounter })
      });

      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      const participantId = 'participant-123';
      const newInitiative = 15;

      await act(async () => {
        await handlers.handleEditInitiative(participantId, newInitiative);
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
      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      act(() => {
        handlers.handleExportInitiative();
      });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('handleExportInitiative sets error when combat is not active', () => {
      mockEncounter.combatState.isActive = false;

      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      act(() => {
        handlers.handleExportInitiative();
      });

      expect(handlers.error).toBe('Combat must be active to export initiative data');
    });

    it('handleShareInitiative copies data to clipboard when navigator.share is not available', () => {
      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      act(() => {
        handlers.handleShareInitiative();
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(`Initiative Order - ${mockEncounter.name}`)
      );
    });

    it('handleShareInitiative sets error when combat is not active', () => {
      mockEncounter.combatState.isActive = false;

      const handlers = useInitiativeTracker({
        encounter: mockEncounter,
        onEncounterUpdate: mockOnEncounterUpdate
      });

      act(() => {
        handlers.handleShareInitiative();
      });

      expect(handlers.error).toBe('Combat must be active to share initiative data');
    });
  });
});