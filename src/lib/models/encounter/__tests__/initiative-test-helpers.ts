import { Types } from 'mongoose';
import { IParticipantWithAbilityScores, InitiativeEntryWithInfo, rollBulkInitiative } from '../initiative-rolling';
import { IInitiativeEntry } from '../interfaces';
import { 
  TEST_IDS, 
  createStandardParticipants, 
  createParticipant, 
  ParticipantConfig,
  MockRollUtils,
  TestAssertions
} from './base-test-helpers';

/**
 * Initiative-specific test helpers
 * Built on top of unified base helpers to eliminate duplication
 */

// Re-export standard IDs for backward compatibility
export const INITIATIVE_PARTICIPANT_IDS = TEST_IDS;

/**
 * Creates a mock participant with customizable properties
 * @deprecated Use createParticipant from base-test-helpers instead
 */
export function createMockParticipant(overrides: Partial<IParticipantWithAbilityScores> = {}): IParticipantWithAbilityScores {
  return createParticipant({
    name: overrides.name || 'Test Participant',
    type: (overrides.type as any) || 'pc',
    dexterity: overrides.abilityScores?.dexterity || 12,
    hitPoints: overrides.maxHitPoints,
    armorClass: overrides.armorClass,
    isPlayer: overrides.isPlayer,
    isVisible: overrides.isVisible,
    initiative: overrides.initiative,
    id: overrides.characterId,
  });
}

/**
 * Get standard participants using unified helpers
 */
export function createFighterParticipant(): IParticipantWithAbilityScores {
  return createStandardParticipants().fighter;
}

export function createRogueParticipant(): IParticipantWithAbilityScores {
  return createStandardParticipants().rogue;
}

export function createOrcParticipant(): IParticipantWithAbilityScores {
  return createStandardParticipants().orc;
}

export function createBasicParticipantSet(): IParticipantWithAbilityScores[] {
  const { fighter, rogue, orc } = createStandardParticipants();
  return [fighter, rogue, orc];
}

/**
 * Creates a mock initiative entry using unified helpers
 */
export function createMockInitiativeEntry(overrides: Partial<IInitiativeEntry> = {}): IInitiativeEntry {
  return {
    participantId: overrides.participantId || new Types.ObjectId(),
    initiative: overrides.initiative || 10,
    dexterity: overrides.dexterity || 12,
    isActive: overrides.isActive || false,
    hasActed: overrides.hasActed || false,
  };
}

/**
 * Creates a basic initiative order for testing
 */
export function createBasicInitiativeOrder(): IInitiativeEntry[] {
  return [
    createMockInitiativeEntry({
      participantId: TEST_IDS.FIGHTER,
      initiative: 15,
      dexterity: 14,
      isActive: true,
      hasActed: false,
    }),
    createMockInitiativeEntry({
      participantId: TEST_IDS.ROGUE,
      initiative: 12,
      dexterity: 18,
      isActive: false,
      hasActed: true,
    }),
  ];
}

/**
 * Mock roll utilities using unified helpers
 */
export function setupInitiativeRollingMock(mockRoll: jest.Mock, returnValue: number): void {
  MockRollUtils.setupSingle(mockRoll, returnValue);
}

export function setupSequentialMockRolls(mockRoll: jest.Mock, values: number[]): void {
  MockRollUtils.setupSequential(mockRoll, values);
}

/**
 * Assertion helpers using unified base helpers
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
  TestAssertions.initiativeEntryStructure(entry, expected);
}

export function expectValidInitiativeOrder(entries: IInitiativeEntry[]): void {
  TestAssertions.validInitiativeOrder(entries);
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