import { PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

/**
 * Mock data types and constants for round tracking tests
 */

// Mock data types
export interface MockEffect {
  id: string;
  name: string;
  participantId: any;
  duration: number;
  startRound: number;
  description: string;
}

export interface MockTrigger {
  id: string;
  name: string;
  triggerRound: number;
  description: string;
  isActive: boolean;
  triggeredRound?: number;
}

export interface MockHistoryEntry {
  round: number;
  events: string[];
}

export interface MockSessionSummary {
  totalRounds: number;
  totalDuration: number;
  participantActions?: number;
  damageDealt?: number;
  healingApplied?: number;
  totalActions?: number;
}

// Standard test data
export const TEST_EFFECTS: MockEffect[] = [
  {
    id: 'effect1',
    name: 'Poison',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 3,
    startRound: 1,
    description: 'Takes 1d6 poison damage',
  },
  {
    id: 'effect2',
    name: 'Bless',
    participantId: PARTICIPANT_IDS.SECOND,
    duration: 10,
    startRound: 2,
    description: '+1d4 to attacks and saves',
  },
  {
    id: 'effect3',
    name: 'Haste',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 1,
    startRound: 2,
    description: 'Double speed, expiring soon',
  },
];

export const TEST_TRIGGERS: MockTrigger[] = [
  {
    id: 'trigger1',
    name: 'Lair Action',
    triggerRound: 3,
    description: 'The dragon uses its lair action',
    isActive: true,
  },
  {
    id: 'trigger2',
    name: 'Reinforcements',
    triggerRound: 5,
    description: 'Orc reinforcements arrive',
    isActive: true,
  },
  {
    id: 'trigger3',
    name: 'Completed Action',
    triggerRound: 1,
    description: 'Already triggered',
    isActive: false,
    triggeredRound: 1,
  },
];

export const TEST_HISTORY: MockHistoryEntry[] = [
  { round: 1, events: ['Combat started', 'Rogue attacks Goblin'] },
  { round: 2, events: ['Wizard casts Fireball', 'Goblin takes damage'] },
];

export const TEST_SESSION_SUMMARY: MockSessionSummary = {
  totalRounds: 5,
  totalDuration: 1800, // 30 minutes
  participantActions: 15,
  damageDealt: 120,
  healingApplied: 45,
  totalActions: 15,
};

// Mock generators
export function createMockEffect(overrides: Partial<MockEffect> = {}): MockEffect {
  return {
    id: `effect-${Date.now()}`,
    name: 'Test Effect',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 5,
    startRound: 1,
    description: 'Test effect description',
    ...overrides,
  };
}

export function createMockTrigger(overrides: Partial<MockTrigger> = {}): MockTrigger {
  return {
    id: `trigger-${Date.now()}`,
    name: 'Test Trigger',
    triggerRound: 3,
    description: 'Test trigger description',
    isActive: true,
    ...overrides,
  };
}

export function createMockEffectsForTesting(overrides: Partial<MockEffect>[] = []): MockEffect[] {
  return overrides.map((override, index) => ({
    id: `effect${index + 1}`,
    name: 'Test Effect',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 3,
    startRound: 1,
    description: 'Test description',
    ...override
  }));
}

export function createMockTriggersForTesting(overrides: Partial<MockTrigger>[] = []): MockTrigger[] {
  return overrides.map((override, index) => ({
    id: `trigger${index + 1}`,
    name: 'Test Trigger',
    triggerRound: 3,
    description: 'Test description',
    isActive: true,
    ...override
  }));
}