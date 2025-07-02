import { Types } from 'mongoose';
import { EncounterService } from '../EncounterService';
import { Encounter } from '@/lib/models/encounter';
import type {
  CreateEncounterInput,
} from '@/lib/models/encounter/interfaces';
import {
  createTestEncounter,
  createTestEncounterInput,
  ENCOUNTER_TEST_CONSTANTS,
} from './EncounterService.test-helpers';

// Mock the entire Encounter model
jest.mock('@/lib/models/encounter', () => ({
  Encounter: {
    createEncounter: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    searchByName: jest.fn(),
    findByDifficulty: jest.fn(),
    findByTargetLevel: jest.fn(),
    findByStatus: jest.fn(),
    findByOwnerId: jest.fn(),
    find: jest.fn(),
  },
}));

const mockEncounter = Encounter as jest.Mocked<typeof Encounter>;

describe('EncounterService - Basic CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEncounter', () => {
    it('should create a new encounter with valid data', async () => {
      const inputData = createTestEncounterInput();
      const expectedEncounter = createTestEncounter();

      mockEncounter.createEncounter.mockResolvedValue(expectedEncounter);

      const result = await EncounterService.createEncounter(inputData);

      expect(result.success).toBe(true);
      expect(result.data).toBe(expectedEncounter);
      expect(mockEncounter.createEncounter).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: inputData.ownerId,
          name: inputData.name,
        })
      );
    });

    it('should handle creation errors', async () => {
      const inputData = createTestEncounterInput();

      mockEncounter.createEncounter.mockRejectedValue(new Error('Database error'));

      const result = await EncounterService.createEncounter(inputData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_CREATION_FAILED');
    });

    it('should validate encounter data', async () => {
      const invalidData = {} as CreateEncounterInput;

      const result = await EncounterService.createEncounter(invalidData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_VALIDATION_ERROR');
    });
  });

  describe('getEncounterById', () => {
    it('should return encounter when found', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const expectedEncounter = createTestEncounter();

      mockEncounter.findById.mockResolvedValue(expectedEncounter);

      const result = await EncounterService.getEncounterById(encounterId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(expectedEncounter);
      expect(mockEncounter.findById).toHaveBeenCalledWith(encounterId);
    });

    it('should return error when not found', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

      mockEncounter.findById.mockResolvedValue(null);

      const result = await EncounterService.getEncounterById(encounterId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
    });

    it('should validate ID format', async () => {
      const invalidId = 'invalid-id';

      const result = await EncounterService.getEncounterById(invalidId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_ID_FORMAT');
    });
  });

  describe('updateEncounter', () => {
    it('should update encounter successfully', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const updateData = { name: 'Updated Name' };
      const updatedEncounter = createTestEncounter();

      mockEncounter.findByIdAndUpdate.mockResolvedValue(updatedEncounter);

      const result = await EncounterService.updateEncounter(encounterId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBe(updatedEncounter);
      expect(mockEncounter.findByIdAndUpdate).toHaveBeenCalledWith(
        encounterId,
        expect.objectContaining(updateData),
        { new: true, runValidators: true }
      );
    });

    it('should return error when encounter not found', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const updateData = { name: 'Updated Name' };

      mockEncounter.findByIdAndUpdate.mockResolvedValue(null);

      const result = await EncounterService.updateEncounter(encounterId, updateData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
    });
  });

  describe('deleteEncounter', () => {
    it('should delete encounter successfully', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const deletedEncounter = createTestEncounter();

      mockEncounter.findByIdAndDelete.mockResolvedValue(deletedEncounter);

      const result = await EncounterService.deleteEncounter(encounterId);

      expect(result.success).toBe(true);
      expect(mockEncounter.findByIdAndDelete).toHaveBeenCalledWith(encounterId);
    });

    it('should return error when encounter not found', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

      mockEncounter.findByIdAndDelete.mockResolvedValue(null);

      const result = await EncounterService.deleteEncounter(encounterId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
    });
  });

  describe('searchEncounters', () => {
    it('should search by name', async () => {
      const searchTerm = 'Dragon';
      const expectedEncounters = [createTestEncounter()];

      mockEncounter.searchByName.mockResolvedValue(expectedEncounters);

      const result = await EncounterService.searchEncounters({ name: searchTerm });

      expect(result.success).toBe(true);
      expect(result.data).toBe(expectedEncounters);
      expect(mockEncounter.searchByName).toHaveBeenCalledWith(searchTerm);
    });

    it('should filter by difficulty', async () => {
      const difficulty = 'hard';
      const expectedEncounters = [createTestEncounter()];

      mockEncounter.findByDifficulty.mockResolvedValue(expectedEncounters);

      const result = await EncounterService.searchEncounters({ difficulty });

      expect(result.success).toBe(true);
      expect(result.data).toBe(expectedEncounters);
      expect(mockEncounter.findByDifficulty).toHaveBeenCalledWith(difficulty);
    });
  });

  describe('getEncountersByOwner', () => {
    it('should return owner encounters', async () => {
      const ownerId = ENCOUNTER_TEST_CONSTANTS.mockOwnerId;
      const expectedEncounters = [createTestEncounter()];

      mockEncounter.findByOwnerId.mockResolvedValue(expectedEncounters);

      const result = await EncounterService.getEncountersByOwner(ownerId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(expectedEncounters);
      expect(mockEncounter.findByOwnerId).toHaveBeenCalledWith(
        new Types.ObjectId(ownerId),
        false
      );
    });

    it('should include shared encounters when requested', async () => {
      const ownerId = ENCOUNTER_TEST_CONSTANTS.mockOwnerId;
      const expectedEncounters = [createTestEncounter()];

      mockEncounter.findByOwnerId.mockResolvedValue(expectedEncounters);

      const result = await EncounterService.getEncountersByOwner(ownerId, true);

      expect(result.success).toBe(true);
      expect(mockEncounter.findByOwnerId).toHaveBeenCalledWith(
        new Types.ObjectId(ownerId),
        true
      );
    });
  });

  describe('cloneEncounter', () => {
    it('should clone encounter successfully', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const newName = 'Cloned Encounter';
      const sourceEncounter = createTestEncounter();
      const clonedEncounter = createTestEncounter();

      // Mock the source encounter methods
      sourceEncounter.duplicateEncounter = jest.fn().mockReturnValue(clonedEncounter);
      clonedEncounter.save = jest.fn().mockResolvedValue(clonedEncounter);

      mockEncounter.findById.mockResolvedValue(sourceEncounter);

      const result = await EncounterService.cloneEncounter(encounterId, newName);

      expect(result.success).toBe(true);
      expect(result.data).toBe(clonedEncounter);
      expect(sourceEncounter.duplicateEncounter).toHaveBeenCalledWith(newName);
      expect(clonedEncounter.save).toHaveBeenCalled();
    });

    it('should return error when source not found', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

      mockEncounter.findById.mockResolvedValue(null);

      const result = await EncounterService.cloneEncounter(encounterId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
    });
  });

  describe('checkOwnership', () => {
    it('should return true for owner', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const userId = ENCOUNTER_TEST_CONSTANTS.mockOwnerId;
      const encounter = createTestEncounter({
        ownerId: new Types.ObjectId(userId),
      });

      mockEncounter.findById.mockResolvedValue(encounter);

      const result = await EncounterService.checkOwnership(encounterId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should return false for non-owner', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
      const userId = 'different-user-id';
      const encounter = createTestEncounter();

      mockEncounter.findById.mockResolvedValue(encounter);

      const result = await EncounterService.checkOwnership(encounterId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });
});