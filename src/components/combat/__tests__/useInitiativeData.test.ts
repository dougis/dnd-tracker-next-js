import { renderHook } from '@testing-library/react';
import { useInitiativeData } from '../useInitiativeData';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Types } from 'mongoose';

describe('useInitiativeData', () => {
  const mockEncounter: IEncounter = {
    _id: new Types.ObjectId(),
    name: 'Test Encounter',
    participants: [
      {
        _id: new Types.ObjectId(),
        characterId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Fighter',
        type: 'player',
        initiative: 15,
        maxHitPoints: 20,
        currentHitPoints: 20,
        armorClass: 16,
        conditions: [],
        temporaryHitPoints: 0,
        notes: ''
      },
      {
        _id: new Types.ObjectId(),
        characterId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Goblin',
        type: 'npc',
        initiative: 12,
        maxHitPoints: 10,
        currentHitPoints: 10,
        armorClass: 13,
        conditions: [],
        temporaryHitPoints: 0,
        notes: ''
      }
    ],
    combatState: {
      isActive: true,
      currentRound: 1,
      currentTurn: 0,
      pausedAt: undefined,
      initiativeOrder: [
        {
          _id: new Types.ObjectId(),
          participantId: new Types.ObjectId('507f1f77bcf86cd799439011'),
          initiative: 15,
          dexterity: 14,
          hasActed: false
        },
        {
          _id: new Types.ObjectId(),
          participantId: new Types.ObjectId('507f1f77bcf86cd799439012'),
          initiative: 12,
          dexterity: 12,
          hasActed: false
        }
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should memoize initiativeWithParticipants calculation', () => {
    const { result, rerender } = renderHook(
      ({ encounter }) => useInitiativeData(encounter),
      { initialProps: { encounter: mockEncounter } }
    );

    const firstResult = result.current.initiativeWithParticipants;

    // Re-render with the same encounter object
    rerender({ encounter: mockEncounter });

    const secondResult = result.current.initiativeWithParticipants;

    // Should return the same reference due to memoization
    expect(firstResult).toBe(secondResult);
  });

  it('should recalculate initiativeWithParticipants when participants change', () => {
    const { result, rerender } = renderHook(
      ({ encounter }) => useInitiativeData(encounter),
      { initialProps: { encounter: mockEncounter } }
    );

    const firstResult = result.current.initiativeWithParticipants;

    // Create a new encounter with different participants
    const modifiedEncounter = {
      ...mockEncounter,
      participants: [
        ...mockEncounter.participants,
        {
          _id: new Types.ObjectId(),
          characterId: new Types.ObjectId('507f1f77bcf86cd799439013'),
          name: 'Wizard',
          type: 'player' as const,
          initiative: 18,
          maxHitPoints: 15,
          currentHitPoints: 15,
          armorClass: 12,
          conditions: [],
          temporaryHitPoints: 0,
          notes: ''
        }
      ]
    };

    rerender({ encounter: modifiedEncounter });

    const secondResult = result.current.initiativeWithParticipants;

    // Should return a different reference due to dependency change
    expect(firstResult).not.toBe(secondResult);
  });

  it('should recalculate initiativeWithParticipants when initiative order changes', () => {
    const { result, rerender } = renderHook(
      ({ encounter }) => useInitiativeData(encounter),
      { initialProps: { encounter: mockEncounter } }
    );

    const firstResult = result.current.initiativeWithParticipants;

    // Create a new encounter with different initiative order
    const modifiedEncounter = {
      ...mockEncounter,
      combatState: {
        ...mockEncounter.combatState,
        initiativeOrder: [
          ...mockEncounter.combatState.initiativeOrder,
          {
            _id: new Types.ObjectId(),
            participantId: new Types.ObjectId('507f1f77bcf86cd799439013'),
            initiative: 18,
            dexterity: 16,
            hasActed: false
          }
        ]
      }
    };

    rerender({ encounter: modifiedEncounter });

    const secondResult = result.current.initiativeWithParticipants;

    // Should return a different reference due to dependency change
    expect(firstResult).not.toBe(secondResult);
  });

  it('should not recalculate when unrelated encounter properties change', () => {
    const { result, rerender } = renderHook(
      ({ encounter }) => useInitiativeData(encounter),
      { initialProps: { encounter: mockEncounter } }
    );

    const firstResult = result.current.initiativeWithParticipants;

    // Create a new encounter with different name (unrelated property)
    const modifiedEncounter = {
      ...mockEncounter,
      name: 'Modified Encounter Name'
    };

    rerender({ encounter: modifiedEncounter });

    const secondResult = result.current.initiativeWithParticipants;

    // Should return the same reference since dependencies haven't changed
    expect(firstResult).toBe(secondResult);
  });

  it('should filter out participants without matching initiative entries', () => {
    const encounterWithMismatchedIds = {
      ...mockEncounter,
      combatState: {
        ...mockEncounter.combatState,
        initiativeOrder: [
          {
            _id: new Types.ObjectId(),
            participantId: new Types.ObjectId('000000000000000000000001'), // Non-existent participant
            initiative: 15,
            dexterity: 14,
            hasActed: false
          },
          {
            _id: new Types.ObjectId(),
            participantId: new Types.ObjectId('507f1f77bcf86cd799439012'), // Valid participant
            initiative: 12,
            dexterity: 12,
            hasActed: false
          }
        ]
      }
    };

    const { result } = renderHook(() => useInitiativeData(encounterWithMismatchedIds));

    // Should only return the entry with a valid participant
    expect(result.current.initiativeWithParticipants).toHaveLength(1);
    expect(result.current.initiativeWithParticipants[0].participant.name).toBe('Goblin');
  });

  it('should return correct canGoPrevious state', () => {
    const { result } = renderHook(() => useInitiativeData(mockEncounter));

    // At round 1, turn 0, should not be able to go previous
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('should return correct isPaused state', () => {
    const { result } = renderHook(() => useInitiativeData(mockEncounter));

    // Combat is not paused
    expect(result.current.isPaused).toBe(false);
  });

  it('should return correct isPaused state when combat is paused', () => {
    const pausedEncounter = {
      ...mockEncounter,
      combatState: {
        ...mockEncounter.combatState,
        pausedAt: new Date()
      }
    };

    const { result } = renderHook(() => useInitiativeData(pausedEncounter));

    // Combat is paused
    expect(result.current.isPaused).toBe(true);
  });

  describe('performance optimization', () => {
    it('should use Map for efficient participant lookup', () => {
      // This test verifies that the implementation uses a Map for O(1) lookups
      // We can't directly test the Map usage, but we can verify the results are correct
      // even with larger datasets
      const largeEncounter = {
        ...mockEncounter,
        participants: Array.from({ length: 100 }, (_, i) => ({
          _id: new Types.ObjectId(),
          characterId: new Types.ObjectId(`507f1f77bcf86cd79943${i.toString().padStart(4, '0')}`),
          name: `Character ${i}`,
          type: 'player' as const,
          initiative: 10,
          maxHitPoints: 20,
          currentHitPoints: 20,
          armorClass: 14,
          conditions: [],
          temporaryHitPoints: 0,
          notes: ''
        })),
        combatState: {
          ...mockEncounter.combatState,
          initiativeOrder: Array.from({ length: 100 }, (_, i) => ({
            _id: new Types.ObjectId(),
            participantId: new Types.ObjectId(`507f1f77bcf86cd79943${i.toString().padStart(4, '0')}`),
            initiative: 10,
            dexterity: 10,
            hasActed: false
          }))
        }
      };

      const { result } = renderHook(() => useInitiativeData(largeEncounter));

      // Should efficiently handle large datasets
      expect(result.current.initiativeWithParticipants).toHaveLength(100);
      expect(result.current.initiativeWithParticipants[0].participant.name).toBe('Character 0');
    });
  });
});