/**
 * Mock Data Factories for Encounter API Testing
 *
 * This module provides factory functions for creating consistent test data
 * across encounter API route tests to eliminate code duplication.
 */

import { Types } from 'mongoose';

// ============================================================================
// BASE DATA TYPES
// ============================================================================

export interface MockParticipant {
  id?: string;
  characterId?: string;
  name: string;
  type: 'pc' | 'npc';
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  armorClass: number;
  initiative?: number;
  isPlayer: boolean;
  isVisible: boolean;
  notes: string;
  conditions: string[];
  position?: { x: number; y: number };
}

export interface MockEncounterSettings {
  allowPlayerVisibility: boolean;
  autoRollInitiative: boolean;
  trackResources: boolean;
  enableLairActions: boolean;
  lairActionInitiative?: number;
  enableGridMovement: boolean;
  gridSize: number;
  roundTimeLimit?: number;
  experienceThreshold?: number;
}

export interface MockEncounter {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  tags: string[];
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  estimatedDuration: number;
  targetLevel: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  isPublic: boolean;
  ownerId?: string;
  participants: MockParticipant[];
  settings: MockEncounterSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// PARTICIPANT FACTORIES
// ============================================================================

/**
 * Creates a basic PC participant
 */
export const createPCParticipant = (overrides: Partial<MockParticipant> = {}): MockParticipant => ({
  id: `pc-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Player Character',
  type: 'pc',
  maxHitPoints: 25,
  currentHitPoints: 25,
  temporaryHitPoints: 0,
  armorClass: 15,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
  ...overrides,
});

/**
 * Creates a basic NPC participant
 */
export const createNPCParticipant = (overrides: Partial<MockParticipant> = {}): MockParticipant => ({
  id: `npc-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test NPC',
  type: 'npc',
  maxHitPoints: 15,
  currentHitPoints: 15,
  temporaryHitPoints: 0,
  armorClass: 12,
  isPlayer: false,
  isVisible: true,
  notes: 'Test enemy creature',
  conditions: [],
  ...overrides,
});

/**
 * Creates a wounded participant (for testing healing/damage)
 */
export const createWoundedParticipant = (overrides: Partial<MockParticipant> = {}): MockParticipant => ({
  ...createPCParticipant(),
  name: 'Wounded Character',
  maxHitPoints: 30,
  currentHitPoints: 10, // Wounded
  temporaryHitPoints: 5,
  conditions: ['poisoned'],
  ...overrides,
});

/**
 * Creates a participant with conditions
 */
export const createConditionedParticipant = (
  conditions: string[] = ['poisoned', 'prone'],
  overrides: Partial<MockParticipant> = {}
): MockParticipant => ({
  ...createPCParticipant(),
  name: 'Affected Character',
  conditions,
  notes: `Character affected by: ${conditions.join(', ')}`,
  ...overrides,
});

// ============================================================================
// ENCOUNTER SETTINGS FACTORIES
// ============================================================================

/**
 * Creates basic encounter settings
 */
export const createBasicSettings = (overrides: Partial<MockEncounterSettings> = {}): MockEncounterSettings => ({
  allowPlayerVisibility: true,
  autoRollInitiative: false,
  trackResources: true,
  enableLairActions: false,
  enableGridMovement: false,
  gridSize: 5,
  ...overrides,
});

/**
 * Creates lair action enabled settings
 */
export const createLairActionSettings = (overrides: Partial<MockEncounterSettings> = {}): MockEncounterSettings => ({
  ...createBasicSettings(),
  enableLairActions: true,
  lairActionInitiative: 20,
  ...overrides,
});

/**
 * Creates grid movement enabled settings
 */
export const createGridMovementSettings = (overrides: Partial<MockEncounterSettings> = {}): MockEncounterSettings => ({
  ...createBasicSettings(),
  enableGridMovement: true,
  gridSize: 5,
  ...overrides,
});

// ============================================================================
// ENCOUNTER FACTORIES
// ============================================================================

/**
 * Creates a basic encounter for testing
 */
export const createBasicEncounter = (overrides: Partial<MockEncounter> = {}): MockEncounter => ({
  _id: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'A test encounter for unit testing',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 30,
  targetLevel: 3,
  status: 'draft',
  isPublic: false,
  ownerId: 'test-user-123',
  participants: [createPCParticipant(), createNPCParticipant()],
  settings: createBasicSettings(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates an encounter with multiple participants
 */
export const createMultiParticipantEncounter = (
  pcCount: number = 2,
  npcCount: number = 3,
  overrides: Partial<MockEncounter> = {}
): MockEncounter => {
  const participants = [
    ...Array.from({ length: pcCount }, (_, i) =>
      createPCParticipant({ name: `Player ${i + 1}` })
    ),
    ...Array.from({ length: npcCount }, (_, i) =>
      createNPCParticipant({ name: `Enemy ${i + 1}` })
    ),
  ];

  return createBasicEncounter({
    name: 'Multi-Participant Encounter',
    description: `Encounter with ${pcCount} PCs and ${npcCount} NPCs`,
    participants,
    ...overrides,
  });
};

/**
 * Creates an encounter with lair actions
 */
export const createLairActionEncounter = (overrides: Partial<MockEncounter> = {}): MockEncounter => ({
  ...createBasicEncounter(),
  name: 'Dragon Lair Encounter',
  description: 'Encounter featuring lair actions',
  difficulty: 'deadly',
  targetLevel: 10,
  settings: createLairActionSettings(),
  participants: [
    createPCParticipant({ name: 'Brave Warrior', maxHitPoints: 80, armorClass: 18 }),
    createNPCParticipant({ name: 'Ancient Dragon', maxHitPoints: 350, armorClass: 22 }),
  ],
  ...overrides,
});

/**
 * Creates a completed encounter
 */
export const createCompletedEncounter = (overrides: Partial<MockEncounter> = {}): MockEncounter => ({
  ...createBasicEncounter(),
  name: 'Completed Encounter',
  status: 'completed',
  participants: [
    createWoundedParticipant({ name: 'Victorious Hero' }),
    createNPCParticipant({ name: 'Defeated Enemy', currentHitPoints: 0 }),
  ],
  ...overrides,
});

/**
 * Creates an archived encounter
 */
export const createArchivedEncounter = (overrides: Partial<MockEncounter> = {}): MockEncounter => ({
  ...createBasicEncounter(),
  name: 'Old Encounter',
  status: 'archived',
  description: 'This encounter has been archived for historical purposes',
  ...overrides,
});

// ============================================================================
// IMPORT/EXPORT DATA FACTORIES
// ============================================================================

/**
 * Creates import metadata
 */
export const createImportMetadata = (overrides: any = {}) => ({
  exportedAt: new Date().toISOString(),
  exportedBy: 'test-user-123',
  format: 'json',
  version: '1.0.0',
  appVersion: '1.0.0',
  ...overrides,
});

/**
 * Creates import data structure
 */
export const createImportData = (
  encounter: Partial<MockEncounter> = {},
  metadata: any = {}
) => ({
  metadata: createImportMetadata(metadata),
  encounter: createBasicEncounter(encounter),
});

/**
 * Creates backup metadata
 */
export const createBackupMetadata = (encounterCount: number = 1, overrides: any = {}) => ({
  backupDate: new Date().toISOString(),
  userId: 'test-user-123',
  encounterCount,
  format: 'json',
  ...overrides,
});

/**
 * Creates backup data structure
 */
export const createBackupData = (
  encounters: MockEncounter[] = [createBasicEncounter()],
  metadata: any = {}
) => ({
  metadata: createBackupMetadata(encounters.length, metadata),
  encounters: encounters.map(encounter => createImportData({ ...encounter })),
});

// ============================================================================
// BATCH OPERATION DATA FACTORIES
// ============================================================================

/**
 * Creates batch operation request data
 */
export const createBatchOperationData = (
  operation: 'export' | 'template' | 'delete' | 'archive' | 'publish',
  encounterIds: string[] = ['id1', 'id2', 'id3'],
  options: any = {}
) => ({
  operation,
  encounterIds,
  options: {
    // Default options based on operation
    ...(operation === 'export' && {
      format: 'json',
      includeCharacterSheets: false,
      includePrivateNotes: false,
      stripPersonalData: true,
    }),
    ...(operation === 'template' && {
      templatePrefix: 'Template',
    }),
    ...(operation === 'archive' && {
      archiveReason: 'Test archival',
    }),
    ...(operation === 'publish' && {
      makePublic: true,
    }),
    ...options,
  },
});

// ============================================================================
// XML DATA FACTORIES
// ============================================================================

/**
 * Creates XML representation of encounter data
 */
export const createXmlEncounter = (encounter: MockEncounter = createBasicEncounter()): string => {
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<encounter>
  <name>${escapeXml(encounter.name)}</name>
  <description>${escapeXml(encounter.description)}</description>
  <difficulty>${encounter.difficulty}</difficulty>
  <targetLevel>${encounter.targetLevel}</targetLevel>
  <participants>
    ${encounter.participants.map(p => `
    <participant>
      <name>${escapeXml(p.name)}</name>
      <type>${p.type}</type>
      <maxHitPoints>${p.maxHitPoints}</maxHitPoints>
      <currentHitPoints>${p.currentHitPoints}</currentHitPoints>
      <armorClass>${p.armorClass}</armorClass>
      <isPlayer>${p.isPlayer}</isPlayer>
    </participant>
    `).join('')}
  </participants>
</encounter>`;
};

/**
 * Creates XML backup data
 */
export const createXmlBackupData = (encounters: MockEncounter[] = [createBasicEncounter()]): string => {
  const metadata = createBackupMetadata(encounters.length, { format: 'xml' });

  return `<?xml version="1.0" encoding="UTF-8"?>
<encounterBackup>
  <metadata>
    <backupDate>${metadata.backupDate}</backupDate>
    <userId>${metadata.userId}</userId>
    <encounterCount>${metadata.encounterCount}</encounterCount>
    <format>${metadata.format}</format>
  </metadata>
  <encounters>
    ${encounters.map(encounter => `
    <encounter>${createXmlEncounter(encounter)}</encounter>
    `).join('')}
  </encounters>
</encounterBackup>`;
};

// ============================================================================
// ERROR SCENARIO DATA FACTORIES
// ============================================================================

/**
 * Creates invalid encounter data for validation testing
 */
export const createInvalidEncounterData = (type: 'missing_name' | 'invalid_difficulty' | 'negative_hp' = 'missing_name') => {
  const base = createBasicEncounter();

  switch (type) {
    case 'missing_name':
      return { ...base, name: '' };
    case 'invalid_difficulty':
      return { ...base, difficulty: 'impossible' as any };
    case 'negative_hp':
      return {
        ...base,
        participants: [
          createPCParticipant({ maxHitPoints: -10 })
        ]
      };
    default:
      return base;
  }
};

/**
 * Creates corrupted import data for error testing
 */
export const createCorruptedImportData = (type: 'missing_metadata' | 'missing_encounter' | 'invalid_structure' = 'missing_metadata') => {
  const base = createImportData();

  switch (type) {
    case 'missing_metadata':
      return { encounter: base.encounter };
    case 'missing_encounter':
      return { metadata: base.metadata };
    case 'invalid_structure':
      return { invalid: 'structure' };
    default:
      return base;
  }
};

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export commonly used test data sets
 */
export const TEST_DATA_SETS = {
  singleEncounter: () => [createBasicEncounter()],
  multipleEncounters: () => [
    createBasicEncounter({ name: 'Encounter 1' }),
    createLairActionEncounter({ name: 'Encounter 2' }),
    createCompletedEncounter({ name: 'Encounter 3' }),
  ],
  differentOwners: () => [
    createBasicEncounter({ ownerId: 'user-1' }),
    createBasicEncounter({ ownerId: 'user-2' }),
    createBasicEncounter({ ownerId: 'user-3' }),
  ],
} as const;