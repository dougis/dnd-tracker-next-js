import { Types } from 'mongoose';
import type {
  IEncounter,
  IParticipantReference,
  CreateEncounterInput,
  IEncounterSettings,
  ICombatState,
} from '@/lib/models/encounter/interfaces';

/**
 * Test constants for Encounter service tests
 */
export const ENCOUNTER_TEST_CONSTANTS = {
  mockEncounterId: '65f1a2b3c4d5e6f7a8b9c0d1',
  mockOwnerId: '65f1a2b3c4d5e6f7a8b9c0d2',
  mockParticipantId: '65f1a2b3c4d5e6f7a8b9c0d3',
  mockCharacterId: '65f1a2b3c4d5e6f7a8b9c0d4',
  mockPartyId: '65f1a2b3c4d5e6f7a8b9c0d5',
} as const;

/**
 * Creates a test participant with default values
 */
export const createTestParticipant = (overrides: Partial<IParticipantReference> = {}): IParticipantReference => ({
  characterId: new Types.ObjectId(ENCOUNTER_TEST_CONSTANTS.mockCharacterId),
  name: 'Test Character',
  type: 'character',
  maxHitPoints: 30,
  currentHitPoints: 30,
  temporaryHitPoints: 0,
  armorClass: 15,
  initiative: 12,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
  position: { x: 0, y: 0 },
  ...overrides,
});

/**
 * Creates default encounter settings for testing
 */
export const createTestEncounterSettings = (overrides: Partial<IEncounterSettings> = {}): IEncounterSettings => ({
  allowPlayerVisibility: true,
  autoRollInitiative: false,
  trackResources: true,
  enableLairActions: false,
  lairActionInitiative: 20,
  enableGridMovement: false,
  gridSize: 5,
  roundTimeLimit: 300,
  experienceThreshold: 5,
  ...overrides,
});

/**
 * Creates default combat state for testing
 */
export const createTestCombatState = (overrides: Partial<ICombatState> = {}): ICombatState => ({
  isActive: false,
  currentRound: 0,
  currentTurn: 0,
  initiativeOrder: [],
  startedAt: undefined,
  pausedAt: undefined,
  endedAt: undefined,
  totalDuration: 0,
  ...overrides,
});

/**
 * Creates a test encounter with default values
 */
export const createTestEncounter = (overrides: Partial<IEncounter> = {}): IEncounter => {
  const baseEncounter = {
    _id: new Types.ObjectId(ENCOUNTER_TEST_CONSTANTS.mockEncounterId),
    ownerId: new Types.ObjectId(ENCOUNTER_TEST_CONSTANTS.mockOwnerId),
    name: 'Test Encounter',
    description: 'A test encounter for unit tests',
    tags: ['test', 'combat'],
    difficulty: 'medium' as const,
    estimatedDuration: 60,
    targetLevel: 5,
    participants: [createTestParticipant()],
    settings: createTestEncounterSettings(),
    combatState: createTestCombatState(),
    status: 'draft' as const,
    partyId: new Types.ObjectId(ENCOUNTER_TEST_CONSTANTS.mockPartyId),
    isPublic: false,
    sharedWith: [],
    version: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),

    // Computed properties
    get participantCount(): number {
      return this.participants.length;
    },
    get playerCount(): number {
      return this.participants.filter(p => p.isPlayer).length;
    },
    get isActive(): boolean {
      return this.combatState.isActive;
    },
    get currentParticipant(): IParticipantReference | null {
      const { isActive, initiativeOrder, currentTurn } = this.combatState;
      if (!isActive || !initiativeOrder.length) return null;

      const currentEntry = initiativeOrder[currentTurn];
      if (!currentEntry) return null;

      return this.participants.find(p =>
        p.characterId.toString() === currentEntry.participantId.toString()
      ) || null;
    },

    // Mock methods
    addParticipant: jest.fn(),
    removeParticipant: jest.fn().mockReturnValue(true),
    updateParticipant: jest.fn().mockReturnValue(true),
    getParticipant: jest.fn(),
    startCombat: jest.fn(),
    endCombat: jest.fn(),
    nextTurn: jest.fn().mockReturnValue(true),
    previousTurn: jest.fn().mockReturnValue(true),
    setInitiative: jest.fn().mockReturnValue(true),
    applyDamage: jest.fn().mockReturnValue(true),
    applyHealing: jest.fn().mockReturnValue(true),
    addCondition: jest.fn().mockReturnValue(true),
    removeCondition: jest.fn().mockReturnValue(true),
    getInitiativeOrder: jest.fn().mockReturnValue([]),
    calculateDifficulty: jest.fn().mockReturnValue('medium'),
    duplicateEncounter: jest.fn(),
    toSummary: jest.fn(),
    save: jest.fn(),
    toObject: jest.fn(),
    toJSON: jest.fn(),
    ...overrides,
  } as unknown as IEncounter;

  return baseEncounter;
};

/**
 * Creates test encounter input data
 */
export const createTestEncounterInput = (overrides: Partial<CreateEncounterInput> = {}): CreateEncounterInput => ({
  ownerId: ENCOUNTER_TEST_CONSTANTS.mockOwnerId,
  name: 'Test Encounter Input',
  description: 'A test encounter input for unit tests',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 45,
  targetLevel: 3,
  participants: [
    {
      characterId: ENCOUNTER_TEST_CONSTANTS.mockCharacterId,
      name: 'Test NPC',
      type: 'npc',
      maxHitPoints: 25,
      currentHitPoints: 25,
      temporaryHitPoints: 0,
      armorClass: 13,
      initiative: 10,
      isPlayer: false,
      isVisible: true,
      notes: '',
      conditions: [],
    }
  ],
  settings: createTestEncounterSettings(),
  partyId: ENCOUNTER_TEST_CONSTANTS.mockPartyId,
  isPublic: false,
  ...overrides,
});

/**
 * Creates mock database query objects
 */
export const mockEncounterQuery = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
};

/**
 * Mock data factories for different test scenarios
 */
export const EncounterTestDataFactories = {

  /**
   * Creates multiple test encounters
   */
  createMultipleEncounters: (count: number = 3): IEncounter[] => {
    return Array.from({ length: count }, (_, index) =>
      createTestEncounter({
        _id: new Types.ObjectId(),
        name: `Test Encounter ${index + 1}`,
        targetLevel: index + 1,
      })
    );
  },

  /**
   * Creates encounter with multiple participants
   */
  createEncounterWithMultipleParticipants: (): IEncounter => {
    const playerConfigs = [
      { name: 'Player 1', armorClass: 16 },
      { name: 'Player 2', armorClass: 14 },
    ];

    const npcConfigs = [
      { name: 'Goblin 1', currentHitPoints: 15 },
      { name: 'Goblin 2', currentHitPoints: 10 },
    ];

    const participants = [
      ...playerConfigs.map(config => createTestParticipant({ ...config, isPlayer: true })),
      ...npcConfigs.map(config => createTestParticipant({
        ...config,
        type: 'npc',
        isPlayer: false,
        maxHitPoints: 15,
        armorClass: 12,
      })),
    ];

    return createTestEncounter({ participants });
  },

  /**
   * Creates active combat encounter
   */
  createActiveCombatEncounter: (): IEncounter => {
    const combatState = createTestCombatState({
      isActive: true,
      currentRound: 2,
      currentTurn: 1,
      initiativeOrder: [
        {
          participantId: new Types.ObjectId(ENCOUNTER_TEST_CONSTANTS.mockCharacterId),
          initiative: 18,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        },
      ],
      startedAt: new Date(),
    });

    return createTestEncounter({ combatState });
  },

  /**
   * Creates public encounter for sharing tests
   */
  createPublicEncounter: (): IEncounter => {
    return createTestEncounter({
      isPublic: true,
      sharedWith: [
        new Types.ObjectId(),
        new Types.ObjectId(),
      ],
    });
  },

  /**
   * Creates encounter with lair actions
   */
  createLairActionEncounter: (): IEncounter => {
    const settings = createTestEncounterSettings({
      enableLairActions: true,
      lairActionInitiative: 20,
    });

    return createTestEncounter({ settings });
  },
};

/**
 * Test search criteria builders
 */
export const SearchCriteriaBuilders = {
  byName: (name: string) => ({ name }),
  byDifficulty: (difficulty: string) => ({ difficulty }),
  byTargetLevel: (targetLevel: number) => ({ targetLevel }),
  byOwner: (ownerId: string) => ({ ownerId }),
  byStatus: (status: string) => ({ status }),
  combined: (criteria: Record<string, any>) => criteria,
};

/**
 * Mock response builders for different scenarios
 */
export const MockResponseBuilders = {
  success: <T>(data: T) => ({
    success: true,
    data,
  }),

  error: (code: string, message: string, statusCode: number = 500) => ({
    success: false,
    error: {
      code,
      message,
      statusCode,
    },
  }),

  validationError: (field: string, message: string) => ({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: `Validation failed: ${field} ${message}`,
      statusCode: 400,
      details: [{ field, message }],
    },
  }),
};

/**
 * Helper for setting up mock implementations
 */
export const setupMockImplementations = {

  /**
   * Sets up successful CRUD operations
   */
  setupSuccessfulCRUD: (encounter: IEncounter) => {
    const methods = ['findById', 'findByIdAndUpdate', 'findByIdAndDelete', 'create'];
    methods.forEach(method => mockEncounterQuery[method].mockResolvedValue(encounter));
  },

  /**
   * Sets up not found responses
   */
  setupNotFound: () => {
    const methods = ['findById', 'findByIdAndUpdate', 'findByIdAndDelete'];
    methods.forEach(method => mockEncounterQuery[method].mockResolvedValue(null));
  },

  /**
   * Sets up database errors
   */
  setupDatabaseError: (errorMessage: string = 'Database connection failed') => {
    const error = new Error(errorMessage);
    const methods = ['findById', 'findByIdAndUpdate', 'findByIdAndDelete', 'create'];
    methods.forEach(method => mockEncounterQuery[method].mockRejectedValue(error));
  },
};