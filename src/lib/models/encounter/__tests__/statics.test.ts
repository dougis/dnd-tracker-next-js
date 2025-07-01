import { Types } from 'mongoose';
import {
  findByOwnerId,
  findByStatus,
  findPublic,
  searchByName,
  findByDifficulty,
  findByTargetLevel,
  findActive,
  createEncounter,
} from '../statics';
import { CreateEncounterInput } from '../interfaces';

// Mock model context
const mockModel = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  save: jest.fn(),
};

describe('Encounter Static Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByOwnerId', () => {
    it('should find encounters by owner ID without shared', async () => {
      const ownerId = new Types.ObjectId();
      
      await findByOwnerId.call(mockModel, ownerId, false);
      
      expect(mockModel.find).toHaveBeenCalledWith({ ownerId });
      expect(mockModel.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });

    it('should find encounters by owner ID with shared', async () => {
      const ownerId = new Types.ObjectId();
      
      await findByOwnerId.call(mockModel, ownerId, true);
      
      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [{ ownerId }, { sharedWith: ownerId }]
      });
      expect(mockModel.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });
  });

  describe('findByStatus', () => {
    it('should find encounters by status', async () => {
      await findByStatus.call(mockModel, 'active');
      
      expect(mockModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(mockModel.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });
  });

  describe('findPublic', () => {
    it('should find public encounters', async () => {
      await findPublic.call(mockModel);
      
      expect(mockModel.find).toHaveBeenCalledWith({ isPublic: true });
      expect(mockModel.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });
  });

  describe('searchByName', () => {
    it('should search encounters by name', async () => {
      await searchByName.call(mockModel, 'dragon');
      
      expect(mockModel.find).toHaveBeenCalledWith({
        $text: { $search: 'dragon' }
      });
      expect(mockModel.sort).toHaveBeenCalledWith({ score: { $meta: 'textScore' } });
    });
  });

  describe('findByDifficulty', () => {
    it('should find encounters by difficulty', async () => {
      await findByDifficulty.call(mockModel, 'hard');
      
      expect(mockModel.find).toHaveBeenCalledWith({ difficulty: 'hard' });
      expect(mockModel.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });
  });

  describe('findByTargetLevel', () => {
    it('should find encounters by target level', async () => {
      await findByTargetLevel.call(mockModel, 5);
      
      expect(mockModel.find).toHaveBeenCalledWith({ targetLevel: 5 });
      expect(mockModel.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    });
  });

  describe('findActive', () => {
    it('should find active encounters', async () => {
      await findActive.call(mockModel);
      
      expect(mockModel.find).toHaveBeenCalledWith({ 'combatState.isActive': true });
      expect(mockModel.sort).toHaveBeenCalledWith({ 'combatState.startedAt': -1 });
    });
  });

  describe('createEncounter', () => {
    it('should create new encounter with default settings', async () => {
      const encounterData: CreateEncounterInput = {
        ownerId: new Types.ObjectId().toString(),
        name: 'Test Encounter',
        description: 'Test description',
        participants: [{
          characterId: new Types.ObjectId(),
          name: 'Test Character',
          type: 'pc',
          maxHitPoints: 100,
          currentHitPoints: 100,
          temporaryHitPoints: 0,
          armorClass: 15,
          isPlayer: true,
          isVisible: true,
          notes: '',
          conditions: [],
        }],
      };

      const mockEncounter = {
        save: jest.fn().mockResolvedValue(true),
      };

      const MockConstructor = jest.fn().mockReturnValue(mockEncounter);
      
      await createEncounter.call(MockConstructor, encounterData);
      
      expect(MockConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Encounter',
          description: 'Test description',
          participants: encounterData.participants,
          isPublic: false,
        })
      );
      expect(mockEncounter.save).toHaveBeenCalled();
    });

    it('should create encounter with custom settings', async () => {
      const encounterData: CreateEncounterInput = {
        ownerId: new Types.ObjectId().toString(),
        name: 'Test Encounter',
        participants: [{
          characterId: new Types.ObjectId(),
          name: 'Test Character',
          type: 'pc',
          maxHitPoints: 100,
          currentHitPoints: 100,
          temporaryHitPoints: 0,
          armorClass: 15,
          isPlayer: true,
          isVisible: true,
          notes: '',
          conditions: [],
        }],
        difficulty: 'hard',
        estimatedDuration: 90,
        targetLevel: 8,
        tags: ['boss', 'dungeon'],
        settings: {
          enableLairActions: true,
          autoRollInitiative: true,
        },
        partyId: new Types.ObjectId().toString(),
        isPublic: true,
      };

      const mockEncounter = {
        save: jest.fn().mockResolvedValue(true),
      };

      const MockConstructor = jest.fn().mockReturnValue(mockEncounter);
      
      await createEncounter.call(MockConstructor, encounterData);
      
      expect(MockConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Encounter',
          difficulty: 'hard',
          estimatedDuration: 90,
          targetLevel: 8,
          tags: ['boss', 'dungeon'],
          isPublic: true,
          settings: expect.objectContaining({
            enableLairActions: true,
            autoRollInitiative: true,
          }),
        })
      );
      expect(mockEncounter.save).toHaveBeenCalled();
    });
  });
});