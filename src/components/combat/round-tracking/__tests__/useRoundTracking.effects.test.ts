import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  performRoundAction,
  createMockEffectsForTesting,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Effect Management', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
  });

  describe('Effect Management', () => {
    const createPoisonEffect = () => createMockEffectsForTesting([{
      id: 'effect1',
      name: 'Poison',
      participantId: PARTICIPANT_IDS.FIRST,
      duration: 3,
      startRound: 1,
      description: 'Takes 1d6 poison damage',
    }]);

    const createBlessEffect = () => createMockEffectsForTesting([{
      id: 'effect2',
      name: 'Bless',
      participantId: PARTICIPANT_IDS.SECOND,
      duration: 10,
      startRound: 2,
      description: '+1d4 to attacks and saves',
    }]);

    const createMultipleEffects = () => [...createPoisonEffect(), ...createBlessEffect()];

    it('adds new effect', () => {
      const { result } = setupRoundTrackingTest();
      const effectData = {
        name: 'Haste',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 10,
        description: 'Double speed',
      };

      performRoundAction(result, 'addEffect', effectData);

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].name).toBe('Haste');
      expect(result.current.effects[0].startRound).toBe(2);
    });

    it('removes effect by id', () => {
      const effects = createMultipleEffects();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: effects });

      performRoundAction(result, 'removeEffect', 'effect1');

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].id).toBe('effect2');
    });

    it('calculates remaining duration for effects', () => {
      const effects = createMultipleEffects();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: effects });

      const poisonEffect = result.current.effects.find(e => e.id === 'effect1');
      expect(result.current.getEffectRemainingDuration(poisonEffect!)).toBe(2);

      const blessEffect = result.current.effects.find(e => e.id === 'effect2');
      expect(result.current.getEffectRemainingDuration(blessEffect!)).toBe(10);
    });

    it('identifies expiring effects', () => {
      const expiringEffects = createMockEffectsForTesting([{
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 2,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      }]);

      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: expiringEffects });

      expect(result.current.getExpiringEffects()).toHaveLength(1);
      expect(result.current.getExpiringEffects()[0].id).toBe('effect1');
    });

    it('automatically removes expired effects on round change', () => {
      const expiredEffects = createMockEffectsForTesting([{
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 1,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      }]);

      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: expiredEffects });

      performRoundAction(result, 'nextRound');

      expect(result.current.effects).toHaveLength(0);
    });

    it('calls onEffectExpiry callback when effects expire', () => {
      const onEffectExpiry = jest.fn();
      const expiredEffects = createMockEffectsForTesting([{
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 1,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      }]);

      const { result } = setupRoundTrackingTest(undefined, undefined, {
        initialEffects: expiredEffects,
        onEffectExpiry
      });

      performRoundAction(result, 'nextRound');

      expect(onEffectExpiry).toHaveBeenCalledWith(['effect1']);
    });
  });
});