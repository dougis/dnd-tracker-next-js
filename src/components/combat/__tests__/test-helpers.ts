import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

/**
 * Creates a standard test encounter with participants for combat component testing
 */
export function createStandardCombatTestEncounter(): IEncounter {
  const mockEncounter = createTestEncounter();
  makeEncounterActive(mockEncounter);
  mockEncounter.combatState.currentTurn = 1;
  mockEncounter.combatState.startedAt = new Date(Date.now() - 120000); // 2 minutes ago
  mockEncounter.combatState.totalDuration = 120000;

  // Add participants to match the initiative order
  mockEncounter.participants = [
    {
      characterId: PARTICIPANT_IDS.FIRST,
      name: 'Test Character 1',
      type: 'Player',
      maxHitPoints: 20,
      currentHitPoints: 20,
      temporaryHitPoints: 0,
      armorClass: 15,
      initiative: 20,
      isPlayer: true,
      isVisible: true,
      notes: '',
      conditions: []
    },
    {
      characterId: PARTICIPANT_IDS.SECOND,
      name: 'Test Character 2',
      type: 'NPC',
      maxHitPoints: 20,
      currentHitPoints: 15,
      temporaryHitPoints: 0,
      armorClass: 14,
      initiative: 15,
      isPlayer: false,
      isVisible: true,
      notes: '',
      conditions: []
    }
  ];

  // Add settings with round timer
  mockEncounter.settings = {
    ...mockEncounter.settings,
    roundTimeLimit: 60000, // 1 minute round timer
  };

  return mockEncounter;
}

/**
 * Creates standard mock action handlers for combat tests
 */
export function createMockCombatActions() {
  return {
    onNextTurn: jest.fn(),
    onPreviousTurn: jest.fn(),
    onPauseCombat: jest.fn(),
    onResumeCombat: jest.fn(),
    onEndCombat: jest.fn(),
    onExportInitiative: jest.fn(),
    onShareInitiative: jest.fn(),
  };
}

/**
 * Creates standard mock initiative actions for combat tests
 */
export function createMockInitiativeActions() {
  return {
    onEditInitiative: jest.fn(),
    onDelayAction: jest.fn(),
    onReadyAction: jest.fn(),
    onRollInitiative: jest.fn(),
  };
}

/**
 * Creates standard mock quick actions for combat tests
 */
export function createMockQuickActions() {
  return {
    onMassHeal: jest.fn(),
    onMassDamage: jest.fn(),
    onClearConditions: jest.fn(),
    onAddParticipant: jest.fn(),
    onEncounterSettings: jest.fn(),
  };
}