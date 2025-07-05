import { Types } from 'mongoose';
import type { EncounterListItem } from '../../types';

/**
 * Creates a mock encounter with sensible defaults and optional overrides
 * Used across multiple test files to eliminate duplication
 */
export const createMockEncounter = (overrides: Partial<EncounterListItem> = {}): EncounterListItem => ({
  id: 'test-encounter-id',
  ownerId: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'A test encounter',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  participants: [],
  settings: {
    allowPlayerNotes: true,
    autoRollInitiative: false,
    trackResources: true,
    enableTurnTimer: false,
    turnTimerDuration: 300,
    showInitiativeToPlayers: true,
  },
  combatState: {
    isActive: false,
    currentTurn: 0,
    currentRound: 0,
    startedAt: null,
    endedAt: null,
    history: [],
  },
  status: 'draft',
  partyId: new Types.ObjectId(),
  isPublic: false,
  sharedWith: [],
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  participantCount: 0,
  playerCount: 0,
  ...overrides,
});

/**
 * Creates multiple mock encounters with incremental IDs and names
 */
export const createMockEncounters = (count: number, baseOverrides: Partial<EncounterListItem> = {}): EncounterListItem[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockEncounter({
      id: `encounter-${index + 1}`,
      name: `Encounter ${index + 1}`,
      ...baseOverrides,
    })
  );
};

/**
 * Creates a mock encounter with combat state
 */
export const createMockCombatEncounter = (overrides: Partial<EncounterListItem> = {}): EncounterListItem => {
  return createMockEncounter({
    combatState: {
      isActive: true,
      currentTurn: 1,
      currentRound: 1,
      startedAt: new Date(),
      endedAt: null,
      history: [],
    },
    status: 'active',
    ...overrides,
  });
};