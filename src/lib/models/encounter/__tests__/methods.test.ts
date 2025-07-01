import { Types } from 'mongoose';
import {
  addParticipant,
  removeParticipant,
  updateParticipant,
  getParticipant,
  startCombat,
  endCombat,
  nextTurn,
  previousTurn,
  setInitiative,
  applyDamage,
  applyHealing,
  addCondition,
  removeCondition,
  getInitiativeOrder,
  calculateDifficulty,
  duplicateEncounter,
  toSummary,
} from '../methods';
import { IEncounter, IParticipantReference } from '../interfaces';

// Mock encounter object
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
  addParticipant: addParticipant.bind(this),
  removeParticipant: removeParticipant.bind(this),
  updateParticipant: updateParticipant.bind(this),
  getParticipant: getParticipant.bind(this),
  startCombat: startCombat.bind(this),
  endCombat: endCombat.bind(this),
  nextTurn: nextTurn.bind(this),
  previousTurn: previousTurn.bind(this),
  setInitiative: setInitiative.bind(this),
  applyDamage: applyDamage.bind(this),
  applyHealing: applyHealing.bind(this),
  addCondition: addCondition.bind(this),
  removeCondition: removeCondition.bind(this),
  getInitiativeOrder: getInitiativeOrder.bind(this),
  calculateDifficulty: calculateDifficulty.bind(this),
  duplicateEncounter: duplicateEncounter.bind(this),
  toSummary: toSummary.bind(this),
});

const createMockParticipant = (): IParticipantReference => ({
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

describe('Encounter Methods', () => {
  let encounter: IEncounter;

  beforeEach(() => {
    encounter = createMockEncounter();
  });

  describe('Participant Management', () => {
    describe('addParticipant', () => {
      it('should add participant to encounter', () => {
        const participantData = {
          characterId: new Types.ObjectId().toString(),
          name: 'Test Character',
          type: 'pc' as const,
          maxHitPoints: 100,
          currentHitPoints: 100,
          temporaryHitPoints: 0,
          armorClass: 15,
          isPlayer: true,
          isVisible: true,
          notes: '',
          conditions: [],
        };

        addParticipant.call(encounter, participantData);
        expect(encounter.participants).toHaveLength(1);
        expect(encounter.participants[0].name).toBe('Test Character');
      });
    });

    describe('removeParticipant', () => {
      it('should remove participant and return true', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];

        const result = removeParticipant.call(
          encounter,
          participant.characterId.toString()
        );
        expect(result).toBe(true);
        expect(encounter.participants).toHaveLength(0);
      });

      it('should return false for non-existent participant', () => {
        const result = removeParticipant.call(
          encounter,
          new Types.ObjectId().toString()
        );
        expect(result).toBe(false);
      });

      it('should remove from initiative order and adjust current turn', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];
        encounter.combatState.initiativeOrder = [
          {
            participantId: participant.characterId,
            initiative: 15,
            dexterity: 14,
            isActive: false,
            hasActed: false,
          },
        ];
        encounter.combatState.currentTurn = 1;

        removeParticipant.call(encounter, participant.characterId.toString());
        expect(encounter.combatState.initiativeOrder).toHaveLength(0);
        expect(encounter.combatState.currentTurn).toBe(0);
      });
    });

    describe('updateParticipant', () => {
      it('should update participant and return true', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];

        const result = updateParticipant.call(
          encounter,
          participant.characterId.toString(),
          {
            currentHitPoints: 50,
          }
        );
        expect(result).toBe(true);
        expect(participant.currentHitPoints).toBe(50);
      });

      it('should return false for non-existent participant', () => {
        const result = updateParticipant.call(
          encounter,
          new Types.ObjectId().toString(),
          {
            currentHitPoints: 50,
          }
        );
        expect(result).toBe(false);
      });
    });

    describe('getParticipant', () => {
      it('should return participant if found', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];

        const result = getParticipant.call(
          encounter,
          participant.characterId.toString()
        );
        expect(result).toBe(participant);
      });

      it('should return null if not found', () => {
        const result = getParticipant.call(
          encounter,
          new Types.ObjectId().toString()
        );
        expect(result).toBeNull();
      });
    });
  });

  describe('Combat Management', () => {
    describe('startCombat', () => {
      it('should initialize combat state', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];

        startCombat.call(encounter);
        expect(encounter.combatState.isActive).toBe(true);
        expect(encounter.combatState.currentRound).toBe(1);
        expect(encounter.combatState.currentTurn).toBe(0);
        expect(encounter.status).toBe('active');
        expect(encounter.combatState.initiativeOrder).toHaveLength(1);
      });

      it('should auto-roll initiative when requested', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];

        startCombat.call(encounter, true);
        expect(
          encounter.combatState.initiativeOrder[0].initiative
        ).toBeGreaterThan(0);
        expect(
          encounter.combatState.initiativeOrder[0].initiative
        ).toBeLessThanOrEqual(20);
      });

      it('should set first participant as active', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];

        startCombat.call(encounter);
        expect(encounter.combatState.initiativeOrder[0].isActive).toBe(true);
      });
    });

    describe('endCombat', () => {
      it('should end combat and reset states', () => {
        encounter.combatState.isActive = true;
        encounter.combatState.startedAt = new Date();
        encounter.combatState.initiativeOrder = [
          {
            participantId: new Types.ObjectId(),
            initiative: 15,
            dexterity: 14,
            isActive: true,
            hasActed: true,
          },
        ];

        endCombat.call(encounter);
        expect(encounter.combatState.isActive).toBe(false);
        expect(encounter.combatState.endedAt).toBeDefined();
        expect(encounter.status).toBe('completed');
        expect(encounter.combatState.initiativeOrder[0].isActive).toBe(false);
        expect(encounter.combatState.initiativeOrder[0].hasActed).toBe(false);
      });
    });

    describe('nextTurn', () => {
      beforeEach(() => {
        encounter.combatState.isActive = true;
        encounter.combatState.initiativeOrder = [
          {
            participantId: new Types.ObjectId(),
            initiative: 20,
            dexterity: 15,
            isActive: true,
            hasActed: false,
          },
          {
            participantId: new Types.ObjectId(),
            initiative: 15,
            dexterity: 12,
            isActive: false,
            hasActed: false,
          },
        ];
      });

      it('should advance to next participant', () => {
        const result = nextTurn.call(encounter);
        expect(result).toBe(true);
        expect(encounter.combatState.currentTurn).toBe(1);
        expect(encounter.combatState.initiativeOrder[0].hasActed).toBe(true);
        expect(encounter.combatState.initiativeOrder[0].isActive).toBe(false);
        expect(encounter.combatState.initiativeOrder[1].isActive).toBe(true);
      });

      it('should start new round when reaching end', () => {
        encounter.combatState.currentTurn = 1;

        const result = nextTurn.call(encounter);
        expect(result).toBe(true);
        expect(encounter.combatState.currentTurn).toBe(0);
        expect(encounter.combatState.currentRound).toBe(1);
        expect(encounter.combatState.initiativeOrder[0].hasActed).toBe(false);
        expect(encounter.combatState.initiativeOrder[1].hasActed).toBe(false);
      });

      it('should return false when combat not active', () => {
        encounter.combatState.isActive = false;
        const result = nextTurn.call(encounter);
        expect(result).toBe(false);
      });
    });

    describe('previousTurn', () => {
      beforeEach(() => {
        encounter.combatState.isActive = true;
        encounter.combatState.currentTurn = 1;
        encounter.combatState.currentRound = 2;
        encounter.combatState.initiativeOrder = [
          {
            participantId: new Types.ObjectId(),
            initiative: 20,
            dexterity: 15,
            isActive: false,
            hasActed: true,
          },
          {
            participantId: new Types.ObjectId(),
            initiative: 15,
            dexterity: 12,
            isActive: true,
            hasActed: false,
          },
        ];
      });

      it('should go back to previous participant', () => {
        const result = previousTurn.call(encounter);
        expect(result).toBe(true);
        expect(encounter.combatState.currentTurn).toBe(0);
        expect(encounter.combatState.initiativeOrder[1].isActive).toBe(false);
        expect(encounter.combatState.initiativeOrder[0].isActive).toBe(true);
        expect(encounter.combatState.initiativeOrder[0].hasActed).toBe(false);
      });

      it('should go to previous round when at start', () => {
        encounter.combatState.currentTurn = 0;

        const result = previousTurn.call(encounter);
        expect(result).toBe(true);
        expect(encounter.combatState.currentTurn).toBe(1);
        expect(encounter.combatState.currentRound).toBe(1);
      });

      it('should return false when combat not active', () => {
        encounter.combatState.isActive = false;
        const result = previousTurn.call(encounter);
        expect(result).toBe(false);
      });
    });
  });

  describe('Initiative and Combat Actions', () => {
    describe('setInitiative', () => {
      it('should update initiative and re-sort order', () => {
        const participantId = new Types.ObjectId();
        encounter.combatState.initiativeOrder = [
          {
            participantId,
            initiative: 10,
            dexterity: 12,
            isActive: true,
            hasActed: false,
          },
          {
            participantId: new Types.ObjectId(),
            initiative: 15,
            dexterity: 14,
            isActive: false,
            hasActed: false,
          },
        ];

        const result = setInitiative.call(
          encounter,
          participantId.toString(),
          20,
          16
        );
        expect(result).toBe(true);
        expect(encounter.combatState.initiativeOrder[0].participantId).toEqual(
          participantId
        );
        expect(encounter.combatState.initiativeOrder[0].initiative).toBe(20);
      });

      it('should return false for non-existent participant', () => {
        const result = setInitiative.call(
          encounter,
          new Types.ObjectId().toString(),
          15,
          12
        );
        expect(result).toBe(false);
      });
    });

    describe('applyDamage', () => {
      it('should apply damage to participant', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];
        encounter.getParticipant = jest.fn().mockReturnValue(participant);

        const result = applyDamage.call(
          encounter,
          participant.characterId.toString(),
          20
        );
        expect(result).toBe(true);
      });

      it('should return false for non-existent participant', () => {
        encounter.getParticipant = jest.fn().mockReturnValue(null);
        const result = applyDamage.call(
          encounter,
          new Types.ObjectId().toString(),
          20
        );
        expect(result).toBe(false);
      });
    });

    describe('applyHealing', () => {
      it('should apply healing to participant', () => {
        const participant = createMockParticipant();
        encounter.participants = [participant];
        encounter.getParticipant = jest.fn().mockReturnValue(participant);

        const result = applyHealing.call(
          encounter,
          participant.characterId.toString(),
          20
        );
        expect(result).toBe(true);
      });

      it('should return false for non-existent participant', () => {
        encounter.getParticipant = jest.fn().mockReturnValue(null);
        const result = applyHealing.call(
          encounter,
          new Types.ObjectId().toString(),
          20
        );
        expect(result).toBe(false);
      });
    });

    describe('addCondition', () => {
      it('should add condition to participant', () => {
        const participant = createMockParticipant();
        encounter.getParticipant = jest.fn().mockReturnValue(participant);

        const result = addCondition.call(
          encounter,
          participant.characterId.toString(),
          'poisoned'
        );
        expect(result).toBe(true);
      });

      it('should return false for non-existent participant', () => {
        encounter.getParticipant = jest.fn().mockReturnValue(null);
        const result = addCondition.call(
          encounter,
          new Types.ObjectId().toString(),
          'poisoned'
        );
        expect(result).toBe(false);
      });
    });

    describe('removeCondition', () => {
      it('should remove condition from participant', () => {
        const participant = createMockParticipant();
        participant.conditions = ['poisoned'];
        encounter.getParticipant = jest.fn().mockReturnValue(participant);

        const result = removeCondition.call(
          encounter,
          participant.characterId.toString(),
          'poisoned'
        );
        expect(result).toBe(true);
      });

      it('should return false for non-existent participant', () => {
        encounter.getParticipant = jest.fn().mockReturnValue(null);
        const result = removeCondition.call(
          encounter,
          new Types.ObjectId().toString(),
          'poisoned'
        );
        expect(result).toBe(false);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getInitiativeOrder', () => {
      it('should return copy of initiative order', () => {
        const initiativeOrder = [
          {
            participantId: new Types.ObjectId(),
            initiative: 15,
            dexterity: 14,
            isActive: false,
            hasActed: false,
          },
        ];
        encounter.combatState.initiativeOrder = initiativeOrder;

        const result = getInitiativeOrder.call(encounter);
        expect(result).toEqual(initiativeOrder);
        expect(result).not.toBe(initiativeOrder);
      });
    });

    describe('calculateDifficulty', () => {
      it('should calculate encounter difficulty', () => {
        encounter.playerCount = 4;
        encounter.participants = [
          createMockParticipant(),
          createMockParticipant(),
          createMockParticipant(),
          createMockParticipant(),
          createMockParticipant(),
          createMockParticipant(),
          createMockParticipant(),
          createMockParticipant(),
        ];

        const result = calculateDifficulty.call(encounter);
        expect(result).toBe('easy');
      });
    });

    describe('duplicateEncounter', () => {
      it('should create duplicate with reset state', () => {
        encounter.toObject = jest.fn().mockReturnValue({
          _id: encounter._id,
          name: encounter.name,
          description: encounter.description,
          status: 'active',
          combatState: { isActive: true },
          version: 2,
        });

        const MockConstructor = jest.fn().mockImplementation(data => data);
        encounter.constructor = MockConstructor;

        duplicateEncounter.call(encounter, 'New Name');
        expect(MockConstructor).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Name',
            status: 'draft',
            version: 1,
          })
        );
      });

      it('should use default copy name if none provided', () => {
        encounter.toObject = jest.fn().mockReturnValue({
          name: encounter.name,
        });
        const MockConstructor = jest.fn().mockImplementation(data => data);
        encounter.constructor = MockConstructor;

        duplicateEncounter.call(encounter);
        expect(MockConstructor).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Encounter (Copy)',
          })
        );
      });
    });

    describe('toSummary', () => {
      it('should return encounter summary', () => {
        const result = toSummary.call(encounter);
        expect(result).toEqual({
          _id: encounter._id,
          name: encounter.name,
          description: encounter.description,
          tags: encounter.tags,
          difficulty: encounter.difficulty,
          estimatedDuration: encounter.estimatedDuration,
          targetLevel: encounter.targetLevel,
          status: encounter.status,
          isPublic: encounter.isPublic,
          participantCount: encounter.participantCount,
          playerCount: encounter.playerCount,
          isActive: encounter.isActive,
          createdAt: encounter.createdAt,
          updatedAt: encounter.updatedAt,
        });
      });
    });
  });
});
