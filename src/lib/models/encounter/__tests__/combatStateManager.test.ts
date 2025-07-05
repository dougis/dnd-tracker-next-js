import { Types } from 'mongoose';
import {
  pauseCombat,
  resumeCombat,
  logCombatAction,
  getCombatHistory,
  clearCombatHistory,
  clearCombatState,
  saveCombatState,
  loadCombatState,
  getCombatPhase,
  validateCombatState,
} from '../combatStateManager';
import { IEncounter, IParticipantReference } from '../interfaces';

// Mock encounter object for testing
const createMockEncounter = (): IEncounter => ({
  _id: new Types.ObjectId(),
  ownerId: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'Test description',
  tags: [],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  status: 'draft',
  participants: [],
  combatState: {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  },
  settings: {
    allowPlayerVisibility: true,
    autoRollInitiative: false,
    trackResources: true,
    enableLairActions: false,
    enableGridMovement: false,
    gridSize: 5,
  },
  isPublic: false,
  participantCount: 0,
  playerCount: 0,
  isActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  toObject: jest.fn().mockReturnValue({}),
  constructor: jest.fn(),
  // Methods bound to the encounter
  addParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  updateParticipant: jest.fn(),
  getParticipant: jest.fn(),
  startCombat: jest.fn(),
  endCombat: jest.fn(),
  nextTurn: jest.fn(),
  previousTurn: jest.fn(),
  setInitiative: jest.fn(),
  applyDamage: jest.fn(),
  applyHealing: jest.fn(),
  addCondition: jest.fn(),
  removeCondition: jest.fn(),
  getInitiativeOrder: jest.fn(),
  calculateDifficulty: jest.fn(),
  duplicateEncounter: jest.fn(),
  toSummary: jest.fn(),
  currentParticipant: null,
  sharedWith: [],
});

const _createMockParticipant = (): IParticipantReference => ({
  characterId: new Types.ObjectId(),
  name: 'Test Character',
  type: 'pc',
  maxHitPoints: 100,
  currentHitPoints: 80,
  temporaryHitPoints: 0,
  armorClass: 15,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
});

describe('Combat State Manager', () => {
  let encounter: IEncounter;

  beforeEach(() => {
    encounter = createMockEncounter();
    // Clear any stored combat history and state
    clearCombatHistory(encounter._id.toString());
    clearCombatState(encounter._id.toString());
  });

  describe('pauseCombat', () => {
    it('should pause active combat', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.startedAt = new Date();

      const result = pauseCombat(encounter);

      expect(result).toBe(true);
      expect(encounter.combatState.pausedAt).toBeDefined();
      expect(encounter.combatState.isActive).toBe(false);
      // Note: status remains 'active' for paused encounters
    });

    it('should return false if combat is not active', () => {
      encounter.combatState.isActive = false;

      const result = pauseCombat(encounter);

      expect(result).toBe(false);
      expect(encounter.combatState.pausedAt).toBeUndefined();
    });

    it('should log pause action to combat history', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 2;

      pauseCombat(encounter);

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('combat_paused');
      expect(history[0].round).toBe(2);
    });
  });

  describe('resumeCombat', () => {
    it('should resume paused combat', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = new Date();
      encounter.status = 'active'; // Combat status remains active when paused

      const result = resumeCombat(encounter);

      expect(result).toBe(true);
      expect(encounter.combatState.isActive).toBe(true);
      expect(encounter.combatState.pausedAt).toBeUndefined();
      expect(encounter.status).toBe('active');
    });

    it('should return false if combat was not paused', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.pausedAt = undefined;

      const result = resumeCombat(encounter);

      expect(result).toBe(false);
    });

    it('should log resume action to combat history', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = new Date();
      encounter.combatState.currentRound = 3;
      encounter.status = 'active'; // Combat status remains active when paused

      resumeCombat(encounter);

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('combat_resumed');
      expect(history[0].round).toBe(3);
    });
  });

  describe('logCombatAction', () => {
    it('should log combat action with correct details', () => {
      encounter.combatState.currentRound = 2;
      encounter.combatState.currentTurn = 1;
      const participantId = new Types.ObjectId();

      logCombatAction(encounter._id.toString(), {
        action: 'damage_dealt',
        participantId,
        details: { damage: 15, target: 'Goblin' },
        round: encounter.combatState.currentRound,
        turn: encounter.combatState.currentTurn,
      });

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('damage_dealt');
      expect(history[0].participantId).toEqual(participantId);
      expect(history[0].details).toEqual({ damage: 15, target: 'Goblin' });
      expect(history[0].round).toBe(2);
      expect(history[0].turn).toBe(1);
      expect(history[0].timestamp).toBeDefined();
    });

    it('should maintain chronological order of actions', (done) => {
      const encounterId = encounter._id.toString();

      logCombatAction(encounterId, {
        action: 'turn_start',
        round: 1,
        turn: 0,
      });

      // Wait a millisecond to ensure different timestamps
      setTimeout(() => {
        logCombatAction(encounterId, {
          action: 'damage_dealt',
          round: 1,
          turn: 0,
        });

        const history = getCombatHistory(encounterId);
        expect(history).toHaveLength(2);
        expect(history[0].timestamp.getTime()).toBeLessThanOrEqual(
          history[1].timestamp.getTime()
        );
        done();
      }, 10);
    });
  });

  describe('getCombatHistory', () => {
    it('should return empty array for encounter with no history', () => {
      const history = getCombatHistory(encounter._id.toString());
      expect(history).toEqual([]);
    });

    it('should return complete combat history', () => {
      const encounterId = encounter._id.toString();

      logCombatAction(encounterId, { action: 'combat_started', round: 1, turn: 0 });
      logCombatAction(encounterId, { action: 'turn_start', round: 1, turn: 0 });
      logCombatAction(encounterId, { action: 'damage_dealt', round: 1, turn: 0 });

      const history = getCombatHistory(encounterId);
      expect(history).toHaveLength(3);
      expect(history.map(h => h.action)).toEqual([
        'combat_started',
        'turn_start',
        'damage_dealt',
      ]);
    });
  });

  describe('clearCombatHistory', () => {
    it('should clear all combat history for encounter', () => {
      const encounterId = encounter._id.toString();

      logCombatAction(encounterId, { action: 'combat_started', round: 1, turn: 0 });
      logCombatAction(encounterId, { action: 'turn_start', round: 1, turn: 0 });

      expect(getCombatHistory(encounterId)).toHaveLength(2);

      clearCombatHistory(encounterId);
      expect(getCombatHistory(encounterId)).toHaveLength(0);
    });
  });

  describe('saveCombatState', () => {
    it('should save combat state to storage', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 3;
      encounter.combatState.currentTurn = 1;
      encounter.combatState.initiativeOrder = [
        {
          participantId: new Types.ObjectId(),
          initiative: 15,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        },
      ];

      const result = saveCombatState(encounter);
      expect(result).toBe(true);
    });

    it('should handle save errors gracefully', () => {
      // Temporarily mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn(() => {
        throw new Error('Serialization failed');
      });

      const result = saveCombatState(encounter);
      expect(result).toBe(false);

      // Restore original JSON.stringify
      JSON.stringify = originalStringify;
    });
  });

  describe('loadCombatState', () => {
    it('should load previously saved combat state', () => {
      // First save a state
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 5;
      encounter.combatState.currentTurn = 2;
      saveCombatState(encounter);

      // Modify the encounter
      encounter.combatState.isActive = false;
      encounter.combatState.currentRound = 1;
      encounter.combatState.currentTurn = 0;

      // Load the saved state
      const result = loadCombatState(encounter);

      expect(result).toBe(true);
      expect(encounter.combatState.isActive).toBe(true);
      expect(encounter.combatState.currentRound).toBe(5);
      expect(encounter.combatState.currentTurn).toBe(2);
    });

    it('should return false if no saved state exists', () => {
      const newEncounter = createMockEncounter();
      // Ensure there's no saved state for this new encounter
      clearCombatState(newEncounter._id.toString());

      const result = loadCombatState(newEncounter);

      expect(result).toBe(false);
    });

    it('should validate loaded state integrity', () => {
      // Mock localStorage with corrupted data
      const originalWindow = global.window;
      global.window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(JSON.stringify({ isActive: 'invalid' })),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        }
      } as any;

      const result = loadCombatState(encounter);
      expect(result).toBe(false);

      // Restore original window
      global.window = originalWindow;
    });
  });

  describe('getCombatPhase', () => {
    it('should return "inactive" for inactive combat', () => {
      encounter.combatState.isActive = false;

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('inactive');
    });

    it('should return "paused" for paused combat', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = new Date();
      encounter.status = 'active'; // Combat status remains active when paused

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('paused');
    });

    it('should return "active" for active combat', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.pausedAt = undefined;

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('active');
    });

    it('should return "ended" for completed combat', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.endedAt = new Date();
      encounter.status = 'completed';

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('ended');
    });
  });

  describe('validateCombatState', () => {
    it('should validate correct combat state', () => {
      const participant1Id = new Types.ObjectId('507f1f77bcf86cd799439011');
      const participant2Id = new Types.ObjectId('507f1f77bcf86cd799439012');

      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 2;
      encounter.combatState.currentTurn = 1;
      encounter.combatState.initiativeOrder = [
        {
          participantId: participant1Id,
          initiative: 15,
          dexterity: 14,
          isActive: false,
          hasActed: false,
        },
        {
          participantId: participant2Id,
          initiative: 12,
          dexterity: 10,
          isActive: true,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect invalid current turn index', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentTurn = 5;
      encounter.combatState.initiativeOrder = [
        {
          participantId: new Types.ObjectId(),
          initiative: 15,
          dexterity: 14,
          isActive: false,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current turn index is out of bounds');
    });

    it('should detect multiple active participants', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.initiativeOrder = [
        {
          participantId: new Types.ObjectId('507f1f77bcf86cd799439011'),
          initiative: 15,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        },
        {
          participantId: new Types.ObjectId('507f1f77bcf86cd799439012'),
          initiative: 12,
          dexterity: 10,
          isActive: true,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Multiple participants marked as active');
    });

    it('should detect negative round number', () => {
      encounter.combatState.currentRound = -1;

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current round cannot be negative');
    });
  });
});