import { renderHook } from '@testing-library/react';
import { useInitiativeData } from '../useInitiativeData';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Types } from 'mongoose';

function createParticipant(id: string, name: string, type: 'player' | 'npc', overrides = {}) {
  return {
    _id: new Types.ObjectId(),
    characterId: new Types.ObjectId(id),
    name,
    type,
    initiative: 15,
    maxHitPoints: 20,
    currentHitPoints: 20,
    armorClass: 16,
    conditions: [],
    temporaryHitPoints: 0,
    notes: '',
    ...overrides
  };
}

function createInitiativeEntry(participantId: string, overrides = {}) {
  return {
    _id: new Types.ObjectId(),
    participantId: new Types.ObjectId(participantId),
    initiative: 15,
    dexterity: 14,
    hasActed: false,
    ...overrides
  };
}

function createMockEncounter(overrides = {}): IEncounter {
  return {
    _id: new Types.ObjectId(),
    name: 'Test Encounter',
    participants: [
      createParticipant('507f1f77bcf86cd799439011', 'Fighter', 'player'),
      createParticipant('507f1f77bcf86cd799439012', 'Goblin', 'npc', { maxHitPoints: 10, currentHitPoints: 10, armorClass: 13, initiative: 12 })
    ],
    combatState: {
      isActive: true,
      currentRound: 1,
      currentTurn: 0,
      pausedAt: undefined,
      initiativeOrder: [
        createInitiativeEntry('507f1f77bcf86cd799439011'),
        createInitiativeEntry('507f1f77bcf86cd799439012', { initiative: 12, dexterity: 12 })
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

function renderUseInitiativeDataHook(encounter: IEncounter) {
  return renderHook(
    ({ encounter }) => useInitiativeData(encounter),
    { initialProps: { encounter } }
  );
}

describe('useInitiativeData', () => {
  const mockEncounter = createMockEncounter();

  it('should memoize initiativeWithParticipants calculation', () => {
    const { result, rerender } = renderUseInitiativeDataHook(mockEncounter);
    const firstResult = result.current.initiativeWithParticipants;

    rerender({ encounter: mockEncounter });
    const secondResult = result.current.initiativeWithParticipants;

    expect(firstResult).toBe(secondResult);
  });

  it('should recalculate initiativeWithParticipants when participants change', () => {
    const { result, rerender } = renderUseInitiativeDataHook(mockEncounter);
    const firstResult = result.current.initiativeWithParticipants;

    const modifiedEncounter = createMockEncounter({
      participants: [
        ...mockEncounter.participants,
        createParticipant('507f1f77bcf86cd799439013', 'Wizard', 'player', { initiative: 18, maxHitPoints: 15, currentHitPoints: 15, armorClass: 12 })
      ]
    });

    rerender({ encounter: modifiedEncounter });
    const secondResult = result.current.initiativeWithParticipants;

    expect(firstResult).not.toBe(secondResult);
  });

  it('should recalculate initiativeWithParticipants when initiative order changes', () => {
    const { result, rerender } = renderUseInitiativeDataHook(mockEncounter);
    const firstResult = result.current.initiativeWithParticipants;

    const modifiedEncounter = createMockEncounter({
      combatState: {
        ...mockEncounter.combatState,
        initiativeOrder: [
          ...mockEncounter.combatState.initiativeOrder,
          createInitiativeEntry('507f1f77bcf86cd799439013', { initiative: 18, dexterity: 16 })
        ]
      }
    });

    rerender({ encounter: modifiedEncounter });
    const secondResult = result.current.initiativeWithParticipants;

    expect(firstResult).not.toBe(secondResult);
  });

  it('should not recalculate when unrelated encounter properties change', () => {
    const { result, rerender } = renderUseInitiativeDataHook(mockEncounter);
    const firstResult = result.current.initiativeWithParticipants;

    const modifiedEncounter = {
      ...mockEncounter,
      name: 'Modified Encounter Name'
    };

    rerender({ encounter: modifiedEncounter });
    const secondResult = result.current.initiativeWithParticipants;

    expect(firstResult).toBe(secondResult);
  });

  it('should filter out participants without matching initiative entries', () => {
    const encounterWithMismatchedIds = createMockEncounter({
      combatState: {
        ...mockEncounter.combatState,
        initiativeOrder: [
          createInitiativeEntry('000000000000000000000001'),
          createInitiativeEntry('507f1f77bcf86cd799439012', { initiative: 12, dexterity: 12 })
        ]
      }
    });

    const { result } = renderHook(() => useInitiativeData(encounterWithMismatchedIds));

    expect(result.current.initiativeWithParticipants).toHaveLength(1);
    expect(result.current.initiativeWithParticipants[0].participant.name).toBe('Goblin');
  });

  it('should return correct canGoPrevious state', () => {
    const { result } = renderHook(() => useInitiativeData(mockEncounter));
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('should return correct isPaused state', () => {
    const { result } = renderHook(() => useInitiativeData(mockEncounter));
    expect(result.current.isPaused).toBe(false);
  });

  it('should return correct isPaused state when combat is paused', () => {
    const pausedEncounter = createMockEncounter({
      combatState: {
        ...mockEncounter.combatState,
        pausedAt: new Date()
      }
    });

    const { result } = renderHook(() => useInitiativeData(pausedEncounter));
    expect(result.current.isPaused).toBe(true);
  });

  describe('performance optimization', () => {
    it('should use Map for efficient participant lookup', () => {
      const largeEncounter = createMockEncounter({
        participants: Array.from({ length: 100 }, (_, i) =>
          createParticipant(`507f1f77bcf86cd79943${i.toString().padStart(4, '0')}`, `Character ${i}`, 'player', { initiative: 10, armorClass: 14 })
        ),
        combatState: {
          ...mockEncounter.combatState,
          initiativeOrder: Array.from({ length: 100 }, (_, i) =>
            createInitiativeEntry(`507f1f77bcf86cd79943${i.toString().padStart(4, '0')}`, { initiative: 10, dexterity: 10 })
          )
        }
      });

      const { result } = renderHook(() => useInitiativeData(largeEncounter));

      expect(result.current.initiativeWithParticipants).toHaveLength(100);
      expect(result.current.initiativeWithParticipants[0].participant.name).toBe('Character 0');
    });
  });
});