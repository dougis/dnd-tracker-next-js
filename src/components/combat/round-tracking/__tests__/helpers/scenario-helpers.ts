import { IEncounter } from '@/lib/models/encounter/interfaces';
import { MockEffect, MockTrigger, TEST_EFFECTS, TEST_TRIGGERS } from './test-data';
import { createMockEncounterWithRound } from './encounter-helpers';

/**
 * Test scenario builders for round tracking tests
 */

// Test scenario builders
export interface RoundTestScenario {
  name: string;
  round: number;
  effects: MockEffect[];
  triggers: MockTrigger[];
  duration?: number;
  maxRounds?: number;
}

export const TEST_SCENARIOS: Record<string, RoundTestScenario> = {
  earlyGame: {
    name: 'Early Game',
    round: 2,
    effects: [TEST_EFFECTS[0]], // Just poison
    triggers: [TEST_TRIGGERS[0]], // Lair action coming up
    duration: 120,
  },
  midGame: {
    name: 'Mid Game',
    round: 5,
    effects: TEST_EFFECTS.slice(0, 2), // Poison and bless
    triggers: TEST_TRIGGERS, // All triggers
    duration: 600,
    maxRounds: 10,
  },
  lateGame: {
    name: 'Late Game',
    round: 8,
    effects: [TEST_EFFECTS[1]], // Just bless remaining
    triggers: [TEST_TRIGGERS[2]], // Completed actions
    duration: 1200,
    maxRounds: 10,
  },
  overtime: {
    name: 'Overtime',
    round: 12,
    effects: [],
    triggers: [],
    duration: 1800,
    maxRounds: 10,
  },
};

export function createScenarioEncounter(scenario: RoundTestScenario): IEncounter {
  const encounter = createMockEncounterWithRound(scenario.round);
  if (scenario.duration) {
    encounter.combatState.startedAt = new Date(Date.now() - (scenario.duration * 1000));
  }
  return encounter;
}

export function getScenario(name: keyof typeof TEST_SCENARIOS): RoundTestScenario {
  return TEST_SCENARIOS[name];
}