import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  performRoundAction,
  createMockTriggersForTesting,
  createMockEncounterWithRound,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Trigger Management', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
  });

  describe('Trigger Management', () => {
    const createLairTrigger = () => createMockTriggersForTesting([{
      id: 'trigger1',
      name: 'Lair Action',
      triggerRound: 3,
      description: 'The dragon uses its lair action',
      isActive: true,
    }]);

    const createReinforcementTrigger = () => createMockTriggersForTesting([{
      id: 'trigger2',
      name: 'Reinforcements',
      triggerRound: 5,
      description: 'Orc reinforcements arrive',
      isActive: true,
    }]);

    const createMultipleTriggers = () => [...createLairTrigger(), ...createReinforcementTrigger()];

    it('adds new trigger', () => {
      const { result } = setupRoundTrackingTest();
      const triggerData = {
        name: 'Trap Activation',
        triggerRound: 4,
        description: 'The floor collapses',
      };

      performRoundAction(result, 'addTrigger', triggerData);

      expect(result.current.triggers).toHaveLength(1);
      expect(result.current.triggers[0].name).toBe('Trap Activation');
    });

    it('activates trigger', () => {
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialTriggers: triggers });

      performRoundAction(result, 'activateTrigger', 'trigger1');

      const trigger = result.current.triggers.find(t => t.id === 'trigger1');
      expect(trigger?.isActive).toBe(false);
      expect(trigger?.triggeredRound).toBe(2);
    });

    it('identifies due triggers', () => {
      const encounter = createMockEncounterWithRound(3);
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(encounter, undefined, { initialTriggers: triggers });

      const dueTriggers = result.current.getDueTriggers();
      expect(dueTriggers).toHaveLength(1);
      expect(dueTriggers[0].id).toBe('trigger1');
    });

    it('gets upcoming triggers', () => {
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialTriggers: triggers });

      const upcomingTriggers = result.current.getUpcomingTriggers();
      expect(upcomingTriggers).toHaveLength(2);
      expect(upcomingTriggers[0].triggerRound).toBeLessThanOrEqual(upcomingTriggers[1].triggerRound);
    });

    it('calls onTriggerActivation callback', () => {
      const onTriggerActivation = jest.fn();
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(undefined, undefined, {
        initialTriggers: triggers,
        onTriggerActivation
      });

      performRoundAction(result, 'activateTrigger', 'trigger1');

      expect(onTriggerActivation).toHaveBeenCalledWith('trigger1', triggers[0]);
    });
  });
});