import { Types } from 'mongoose';
import { IParticipantWithAbilityScores, InitiativeEntryWithInfo, rollBulkInitiative } from '../initiative-rolling';
import { IInitiativeEntry } from '../interfaces';

/**
 * Test helper utilities for initiative rolling tests
 * Eliminates code duplication and provides reusable test components
 */

// Common participant IDs for consistent testing
export const INITIATIVE_PARTICIPANT_IDS = {
  FIGHTER: new Types.ObjectId('507f1f77bcf86cd799439011'),
  ROGUE: new Types.ObjectId('507f1f77bcf86cd799439012'),
  ORC: new Types.ObjectId('507f1f77bcf86cd799439013'),
};

/**
 * Creates a mock participant with customizable properties
 */
export function createMockParticipant(overrides: Partial<IParticipantWithAbilityScores> = {}): IParticipantWithAbilityScores {
  return {
    characterId: new Types.ObjectId(),
    name: 'Test Participant',
    type: 'pc',
    initiative: 0,
    armorClass: 15,
    maxHitPoints: 30,
    currentHitPoints: 30,
    temporaryHitPoints: 0,
    conditions: [],
    notes: '',
    isPlayer: true,
    isVisible: true,
    abilityScores: {
      strength: 10,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 10,
    },
    ...overrides,
  };
}

/**
 * Creates a Fighter participant with standard stats
 */
export function createFighterParticipant(): IParticipantWithAbilityScores {
  return createMockParticipant({
    characterId: INITIATIVE_PARTICIPANT_IDS.FIGHTER,
    name: 'Fighter',
    type: 'pc',
    armorClass: 18,
    maxHitPoints: 45,
    currentHitPoints: 45,
    isPlayer: false,
    abilityScores: {
      strength: 16,
      dexterity: 14, // +2 modifier
      constitution: 16,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
  });
}

/**
 * Creates a Rogue participant with standard stats
 */
export function createRogueParticipant(): IParticipantWithAbilityScores {
  return createMockParticipant({
    characterId: INITIATIVE_PARTICIPANT_IDS.ROGUE,
    name: 'Rogue',
    type: 'pc',
    armorClass: 15,
    maxHitPoints: 38,
    currentHitPoints: 38,
    isPlayer: true,
    abilityScores: {
      strength: 10,
      dexterity: 18, // +4 modifier
      constitution: 14,
      intelligence: 12,
      wisdom: 14,
      charisma: 10,
    },
  });
}

/**
 * Creates an Orc participant with standard stats
 */
export function createOrcParticipant(): IParticipantWithAbilityScores {
  return createMockParticipant({
    characterId: INITIATIVE_PARTICIPANT_IDS.ORC,
    name: 'Orc Warrior',
    type: 'npc',
    armorClass: 13,
    maxHitPoints: 15,
    currentHitPoints: 15,
    isPlayer: false,
    abilityScores: {
      strength: 16,
      dexterity: 12, // +1 modifier
      constitution: 16,
      intelligence: 7,
      wisdom: 11,
      charisma: 10,
    },
  });
}

/**
 * Creates a standard set of participants for testing
 */
export function createBasicParticipantSet(): IParticipantWithAbilityScores[] {
  return [
    createFighterParticipant(),
    createRogueParticipant(),
    createOrcParticipant(),
  ];
}

/**
 * Creates a mock initiative entry
 */
export function createMockInitiativeEntry(overrides: Partial<IInitiativeEntry> = {}): IInitiativeEntry {
  return {
    participantId: new Types.ObjectId(),
    initiative: 10,
    dexterity: 12,
    isActive: false,
    hasActed: false,
    ...overrides,
  };
}

/**
 * Creates a basic initiative order for testing
 */
export function createBasicInitiativeOrder(): IInitiativeEntry[] {
  return [
    createMockInitiativeEntry({
      participantId: INITIATIVE_PARTICIPANT_IDS.FIGHTER,
      initiative: 15,
      dexterity: 14,
      isActive: true,
      hasActed: false,
    }),
    createMockInitiativeEntry({
      participantId: INITIATIVE_PARTICIPANT_IDS.ROGUE,
      initiative: 12,
      dexterity: 18,
      isActive: false,
      hasActed: true,
    }),
  ];
}

/**
 * Sets up initiative rolling mock to return a specific value
 */
export function setupInitiativeRollingMock(mockRoll: jest.Mock, returnValue: number): void {
  mockRoll.mockReturnValueOnce(returnValue);
}

/**
 * Sets up sequential mock rolls for multiple participants
 */
export function setupSequentialMockRolls(mockRoll: jest.Mock, values: number[]): void {
  let mockChain = mockRoll;
  values.forEach(value => {
    mockChain = mockChain.mockReturnValueOnce(value);
  });
}

/**
 * Expects optional fields on initiative entry to match expected values
 */
function expectOptionalFields(
  entry: IInitiativeEntry | InitiativeEntryWithInfo,
  expected: Partial<{
    participantId: Types.ObjectId;
    dexterity: number;
    isActive: boolean;
    hasActed: boolean;
    initiative: number;
    name: string;
    type: 'pc' | 'npc' | 'monster';
  }>
): void {
  if (expected.participantId) {
    expect(entry.participantId).toEqual(expected.participantId);
  }
  if (expected.dexterity !== undefined) {
    expect(entry.dexterity).toBe(expected.dexterity);
  }
  if (expected.isActive !== undefined) {
    expect(entry.isActive).toBe(expected.isActive);
  }
  if (expected.hasActed !== undefined) {
    expect(entry.hasActed).toBe(expected.hasActed);
  }
  if (expected.initiative !== undefined) {
    expect(entry.initiative).toBe(expected.initiative);
  }
}

/**
 * Expects extended entry fields to match expected values
 */
function expectExtendedFields(
  entry: IInitiativeEntry | InitiativeEntryWithInfo,
  expected: Partial<{
    name: string;
    type: 'pc' | 'npc' | 'monster';
  }>
): void {
  if (expected.name && 'name' in entry) {
    expect(entry.name).toBe(expected.name);
  }
  if (expected.type && 'type' in entry) {
    expect(entry.type).toBe(expected.type);
  }
}

/**
 * Expects required entry types to be correct
 */
function expectRequiredTypes(entry: IInitiativeEntry | InitiativeEntryWithInfo): void {
  expect(typeof entry.initiative).toBe('number');
  expect(typeof entry.participantId).toBe('object');
  expect(typeof entry.dexterity).toBe('number');
  expect(typeof entry.isActive).toBe('boolean');
  expect(typeof entry.hasActed).toBe('boolean');
}

/**
 * Expects an initiative entry to have the correct structure
 */
export function expectInitiativeEntryStructure(
  entry: IInitiativeEntry | InitiativeEntryWithInfo,
  expected: Partial<{
    participantId: Types.ObjectId;
    dexterity: number;
    isActive: boolean;
    hasActed: boolean;
    initiative: number;
    name: string;
    type: 'pc' | 'npc' | 'monster';
  }>
): void {
  expectOptionalFields(entry, expected);
  expectExtendedFields(entry, expected);
  expectRequiredTypes(entry);
}

/**
 * Expects initiative entries to be properly sorted
 */
export function expectValidInitiativeOrder(entries: IInitiativeEntry[]): void {
  for (let i = 0; i < entries.length - 1; i++) {
    const current = entries[i];
    const next = entries[i + 1];

    // Higher initiative should come first
    if (current.initiative === next.initiative) {
      // If initiative is tied, higher dexterity should come first
      expect(current.dexterity).toBeGreaterThanOrEqual(next.dexterity);
    } else {
      expect(current.initiative).toBeGreaterThan(next.initiative);
    }
  }
}

/**
 * Expects an InitiativeEntryWithInfo to have the correct extended structure
 */
export function expectInitiativeEntryWithInfo(
  entry: InitiativeEntryWithInfo,
  expectedName: string,
  expectedType: 'pc' | 'npc' | 'monster'
): void {
  expect(entry.name).toBe(expectedName);
  expect(entry.type).toBe(expectedType);
  expect(entry.participantId).toBeDefined();
  expect(typeof entry.initiative).toBe('number');
  expect(typeof entry.dexterity).toBe('number');
  expect(typeof entry.isActive).toBe('boolean');
  expect(typeof entry.hasActed).toBe('boolean');
}

/**
 * Finds an initiative entry by participant ID
 */
export function findInitiativeEntry(
  entries: IInitiativeEntry[],
  participantId: Types.ObjectId
): IInitiativeEntry | undefined {
  return entries.find(entry => entry.participantId.toString() === participantId.toString());
}


/**
 * Asserts that all participants in a list have the expected initiative values
 */
export function expectParticipantInitiatives(
  entries: IInitiativeEntry[],
  expectedInitiatives: number[]
): void {
  expect(entries).toHaveLength(expectedInitiatives.length);
  entries.forEach((entry, index) => {
    expect(entry.initiative).toBe(expectedInitiatives[index]);
  });
}

/**
 * Creates a test scenario for dexterity tiebreaker testing
 */
export function createTiebreakingScenario(): {
  participants: IParticipantWithAbilityScores[];
  expectedOrder: string[];
  mockRolls: number[];
} {
  const participants = [
    createMockParticipant({
      name: 'Low Dex Fighter',
      abilityScores: { ...createFighterParticipant().abilityScores, dexterity: 12 }
    }),
    createMockParticipant({
      name: 'High Dex Rogue',
      abilityScores: { ...createRogueParticipant().abilityScores, dexterity: 18 }
    }),
    createMockParticipant({
      name: 'Mid Dex Warrior',
      abilityScores: { ...createOrcParticipant().abilityScores, dexterity: 14 }
    }),
  ];

  // All roll the same d20 value to force tiebreaker
  const mockRolls = [10, 8, 11]; // Results in same total (12) for all
  const expectedOrder = ['High Dex Rogue', 'Mid Dex Warrior', 'Low Dex Fighter'];

  return { participants, expectedOrder, mockRolls };
}

/**
 * Resets all mocks and clears mock history
 */
export function resetAllMocks(): void {
  jest.clearAllMocks();
}

/**
 * Creates participants with specific initiative values for testing
 */
export function createParticipantsWithInitiative(
  baseParticipants: IParticipantWithAbilityScores[],
  initiativeValues: number[]
): IParticipantWithAbilityScores[] {
  return baseParticipants.map((p, index) => ({
    ...p,
    initiative: initiativeValues[index] ?? (index + 1) * 5, // Use provided values or default pattern
  }));
}

/**
 * Validates structure of multiple initiative entries
 */
export function expectMultipleInitiativeStructures(
  entries: IInitiativeEntry[],
  participants: IParticipantWithAbilityScores[]
): void {
  entries.forEach((entry, index) => {
    expectInitiativeEntryStructure(entry, {
      participantId: participants[index].characterId,
      dexterity: participants[index].abilityScores.dexterity,
      isActive: false,
      hasActed: false,
      initiative: 0,
    });
  });
}

/**
 * Validates that all entries have initiative value of 0
 */
export function expectAllInitiativeZero(entries: IInitiativeEntry[]): void {
  entries.forEach(entry => {
    expectInitiativeEntryStructure(entry, { initiative: 0 });
  });
}

/**
 * Sets up mock roll and returns entries with expectation checking
 */
export function rollInitiativeWithMockAndExpect(
  mockRoll: jest.Mock,
  rollValue: number,
  participants: IParticipantWithAbilityScores[]
): any[] {
  setupInitiativeRollingMock(mockRoll, rollValue);
  const entries = rollBulkInitiative(participants);

  expect(entries).toHaveLength(participants.length);
  expectValidInitiativeOrder(entries);

  return entries;
}

/**
 * Resets the initiative rolling mock specifically
 */
export function resetInitiativeRollingMock(): void {
  const mockRoll = jest.requireMock('../utils').rollInitiative;
  mockRoll.mockClear();
  mockRoll.mockReturnValue(10); // Default return value
}

/**
 * Creates a Fighter initiative entry with defaults
 */
export function createFighterInitiativeEntry(overrides: Partial<IInitiativeEntry> = {}): IInitiativeEntry {
  return createMockInitiativeEntry({
    participantId: INITIATIVE_PARTICIPANT_IDS.FIGHTER,
    initiative: 15,
    dexterity: 14,
    isActive: false,
    hasActed: false,
    ...overrides,
  });
}

/**
 * Creates a Rogue initiative entry with defaults
 */
export function createRogueInitiativeEntry(overrides: Partial<IInitiativeEntry> = {}): IInitiativeEntry {
  return createMockInitiativeEntry({
    participantId: INITIATIVE_PARTICIPANT_IDS.ROGUE,
    initiative: 12,
    dexterity: 18,
    isActive: false,
    hasActed: false,
    ...overrides,
  });
}

/**
 * Expects initiative entries to be in correct order by name
 */
export function expectInitiativeOrderSort(entries: (IInitiativeEntry | InitiativeEntryWithInfo)[], expectedNames: string[]): void {
  expect(entries).toHaveLength(expectedNames.length);
  entries.forEach((entry, index) => {
    if ('name' in entry) {
      expect(entry.name).toBe(expectedNames[index]);
    } else {
      // For entries without name, we need to match by participantId
      const participant = createBasicParticipantSet().find(p =>
        p.characterId.toString() === entry.participantId.toString()
      );
      expect(participant?.name).toBe(expectedNames[index]);
    }
  });
}