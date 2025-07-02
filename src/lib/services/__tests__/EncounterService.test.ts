import { Types } from 'mongoose';
import { EncounterService } from '../EncounterService';
import { Encounter } from '@/lib/models/encounter';
import type {
  CreateEncounterInput,
} from '@/lib/models/encounter/interfaces';
import {
  createTestEncounter,
  createTestParticipant,
  createTestEncounterInput,
  ENCOUNTER_TEST_CONSTANTS,
} from './EncounterService.test-helpers';

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

// Mock Types.ObjectId.isValid after importing
const { Types } = require('mongoose');
Types.ObjectId.isValid = jest.fn((id: string) => {
  // Basic ObjectId validation - 24 character hex string
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
});

const MockedEncounter = jest.mocked(Encounter);

describe('EncounterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    describe('createEncounter', () => {
      it('should create a new encounter with valid data', async () => {
        const mockEncounterData: CreateEncounterInput = createTestEncounterInput();
        const mockEncounter = createTestEncounter();

        MockedEncounter.createEncounter.mockResolvedValue(mockEncounter);

        const result = await EncounterService.createEncounter(mockEncounterData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounter);
        expect(MockedEncounter.createEncounter).toHaveBeenCalledWith(
          expect.objectContaining({
            ownerId: mockEncounterData.ownerId,
            name: mockEncounterData.name,
            description: mockEncounterData.description,
            tags: mockEncounterData.tags,
            difficulty: mockEncounterData.difficulty,
            estimatedDuration: mockEncounterData.estimatedDuration,
            targetLevel: mockEncounterData.targetLevel,
            participants: mockEncounterData.participants,
            settings: mockEncounterData.settings,
            partyId: mockEncounterData.partyId,
            isPublic: mockEncounterData.isPublic,
          })
        );
      });

      it('should return error when encounter creation fails', async () => {
        const mockEncounterData: CreateEncounterInput = createTestEncounterInput();

        MockedEncounter.createEncounter.mockRejectedValue(new Error('Database error'));

        const result = await EncounterService.createEncounter(mockEncounterData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_CREATION_FAILED');
        expect(result.error?.statusCode).toBe(500);
      });

      it('should validate required fields in encounter data', async () => {
        const invalidData = {} as CreateEncounterInput;

        const result = await EncounterService.createEncounter(invalidData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_VALIDATION_ERROR');
      });
    });

    describe('getEncounterById', () => {
      it('should return encounter when found', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.getEncounterById(encounterId);

        // Debug removed

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounter);
        expect(mockFindById).toHaveBeenCalledWith(encounterId);
      });

      it('should return error when encounter not found', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

        const mockFindById = jest.fn().mockResolvedValue(null);
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.getEncounterById(encounterId);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
        expect(result.error?.statusCode).toBe(404);
      });

      it('should validate encounter ID format', async () => {
        const invalidId = 'invalid-id';

        const result = await EncounterService.getEncounterById(invalidId);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_ENCOUNTER_ID');
      });
    });

    describe('updateEncounter', () => {
      it('should update encounter with valid data', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const updateData = { name: 'Updated Encounter Name' };
        const mockEncounter = createTestEncounter();

        const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(mockEncounter);
        (Encounter.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;

        const result = await EncounterService.updateEncounter(encounterId, updateData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounter);
        expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
          encounterId,
          updateData,
          { new: true, runValidators: true }
        );
      });

      it('should return error when encounter not found for update', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const updateData = { name: 'Updated Name' };

        const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(null);
        (Encounter.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;

        const result = await EncounterService.updateEncounter(encounterId, updateData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
      });
    });

    describe('deleteEncounter', () => {
      it('should delete encounter when found', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

        const mockFindByIdAndDelete = jest.fn().mockResolvedValue(createTestEncounter());
        (Encounter.findByIdAndDelete as jest.Mock) = mockFindByIdAndDelete;

        const result = await EncounterService.deleteEncounter(encounterId);

        expect(result.success).toBe(true);
        expect(mockFindByIdAndDelete).toHaveBeenCalledWith(encounterId);
      });

      it('should return error when encounter not found for deletion', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

        const mockFindByIdAndDelete = jest.fn().mockResolvedValue(null);
        (Encounter.findByIdAndDelete as jest.Mock) = mockFindByIdAndDelete;

        const result = await EncounterService.deleteEncounter(encounterId);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
      });
    });
  });

  describe('Participant Management', () => {
    describe('addParticipant', () => {
      it('should add participant to encounter', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const participantData = {
          ...createTestParticipant(),
          characterId: ENCOUNTER_TEST_CONSTANTS.mockCharacterId, // Use string instead of ObjectId
          type: 'pc' as const, // Use valid participant type
        };
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockSave = jest.fn().mockResolvedValue(mockEncounter);
        const mockAddParticipant = jest.fn();

        mockEncounter.addParticipant = mockAddParticipant;
        mockEncounter.save = mockSave;

        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.addParticipant(encounterId, participantData);

        // Debug removed

        expect(result.success).toBe(true);
        expect(mockAddParticipant).toHaveBeenCalledWith(participantData);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should validate participant data before adding', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const invalidParticipant = {} as any;

        const result = await EncounterService.addParticipant(encounterId, invalidParticipant);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_VALIDATION_ERROR');
      });
    });

    describe('removeParticipant', () => {
      it('should remove participant from encounter', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const participantId = ENCOUNTER_TEST_CONSTANTS.mockParticipantId;
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockSave = jest.fn().mockResolvedValue(mockEncounter);
        const mockRemoveParticipant = jest.fn().mockReturnValue(true);

        mockEncounter.removeParticipant = mockRemoveParticipant;
        mockEncounter.save = mockSave;

        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.removeParticipant(encounterId, participantId);

        expect(result.success).toBe(true);
        expect(mockRemoveParticipant).toHaveBeenCalledWith(participantId);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should return error when participant not found', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const participantId = ENCOUNTER_TEST_CONSTANTS.mockParticipantId;
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockRemoveParticipant = jest.fn().mockReturnValue(false);

        mockEncounter.removeParticipant = mockRemoveParticipant;

        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.removeParticipant(encounterId, participantId);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PARTICIPANT_NOT_FOUND');
      });
    });

    describe('updateParticipant', () => {
      it('should update participant data', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const participantId = ENCOUNTER_TEST_CONSTANTS.mockParticipantId;
        const updateData = { currentHitPoints: 25 };
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockSave = jest.fn().mockResolvedValue(mockEncounter);
        const mockUpdateParticipant = jest.fn().mockReturnValue(true);

        mockEncounter.updateParticipant = mockUpdateParticipant;
        mockEncounter.save = mockSave;

        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.updateParticipant(
          encounterId,
          participantId,
          updateData
        );

        expect(result.success).toBe(true);
        expect(mockUpdateParticipant).toHaveBeenCalledWith(participantId, updateData);
        expect(mockSave).toHaveBeenCalled();
      });
    });
  });

  describe('Search and Filtering', () => {
    describe('searchEncounters', () => {
      it('should search encounters by name', async () => {
        const searchTerm = 'Dragon';
        const mockEncounters = [createTestEncounter()];

        const mockSearchByName = jest.fn().mockResolvedValue(mockEncounters);
        (Encounter.searchByName as jest.Mock) = mockSearchByName;

        const result = await EncounterService.searchEncounters({ name: searchTerm });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounters);
        expect(mockSearchByName).toHaveBeenCalledWith(searchTerm);
      });

      it('should filter encounters by difficulty', async () => {
        const difficulty = 'hard';
        const mockEncounters = [createTestEncounter()];

        const mockFindByDifficulty = jest.fn().mockResolvedValue(mockEncounters);
        (Encounter.findByDifficulty as jest.Mock) = mockFindByDifficulty;

        const result = await EncounterService.searchEncounters({ difficulty });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounters);
        expect(mockFindByDifficulty).toHaveBeenCalledWith(difficulty);
      });

      it('should filter encounters by target level', async () => {
        const targetLevel = 5;
        const mockEncounters = [createTestEncounter()];

        const mockFindByTargetLevel = jest.fn().mockResolvedValue(mockEncounters);
        (Encounter.findByTargetLevel as jest.Mock) = mockFindByTargetLevel;

        const result = await EncounterService.searchEncounters({ targetLevel });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounters);
        expect(mockFindByTargetLevel).toHaveBeenCalledWith(targetLevel);
      });
    });

    describe('getEncountersByOwner', () => {
      it('should return encounters for owner', async () => {
        const ownerId = ENCOUNTER_TEST_CONSTANTS.mockOwnerId;
        const mockEncounters = [createTestEncounter()];

        const mockFindByOwnerId = jest.fn().mockResolvedValue(mockEncounters);
        (Encounter.findByOwnerId as jest.Mock) = mockFindByOwnerId;

        const result = await EncounterService.getEncountersByOwner(ownerId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEncounters);
        expect(mockFindByOwnerId).toHaveBeenCalledWith(
          expect.objectContaining({
            toString: expect.any(Function)
          }),
          false
        );
        // Verify the ObjectId string value
        const callArgs = mockFindByOwnerId.mock.calls[0];
        expect(callArgs[0].toString()).toBe(ownerId);
      });

      it('should include shared encounters when specified', async () => {
        const ownerId = ENCOUNTER_TEST_CONSTANTS.mockOwnerId;
        const includeShared = true;
        const mockEncounters = [createTestEncounter()];

        const mockFindByOwnerId = jest.fn().mockResolvedValue(mockEncounters);
        (Encounter.findByOwnerId as jest.Mock) = mockFindByOwnerId;

        const result = await EncounterService.getEncountersByOwner(ownerId, includeShared);

        expect(result.success).toBe(true);
        expect(mockFindByOwnerId).toHaveBeenCalledWith(
          expect.objectContaining({
            toString: expect.any(Function)
          }),
          true
        );
        // Verify the ObjectId string value
        const callArgs = mockFindByOwnerId.mock.calls[0];
        expect(callArgs[0].toString()).toBe(ownerId);
      });
    });
  });

  describe('Template and Cloning', () => {
    describe('cloneEncounter', () => {
      it('should clone encounter with new name', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const newName = 'Cloned Encounter';
        const mockEncounter = createTestEncounter();
        const mockClonedEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockDuplicateEncounter = jest.fn().mockReturnValue(mockClonedEncounter);
        const mockSave = jest.fn().mockResolvedValue(mockClonedEncounter);

        mockEncounter.duplicateEncounter = mockDuplicateEncounter;
        mockClonedEncounter.save = mockSave;

        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.cloneEncounter(encounterId, newName);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockClonedEncounter);
        expect(mockDuplicateEncounter).toHaveBeenCalledWith(newName);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should return error when source encounter not found', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const newName = 'Cloned Encounter';

        const mockFindById = jest.fn().mockResolvedValue(null);
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.cloneEncounter(encounterId, newName);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
      });
    });

    describe('createTemplate', () => {
      it('should create template from encounter', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const templateName = 'Dragon Encounter Template';
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockToSummary = jest.fn().mockReturnValue({
          ...mockEncounter,
          name: templateName,
          isTemplate: true,
        });

        mockEncounter.toSummary = mockToSummary;
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.createTemplate(encounterId, templateName);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe(templateName);
        expect(mockToSummary).toHaveBeenCalled();
      });
    });
  });

  describe('Ownership and Permissions', () => {
    describe('checkOwnership', () => {
      it('should return true for encounter owner', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const userId = ENCOUNTER_TEST_CONSTANTS.mockOwnerId;
        const mockEncounter = createTestEncounter({ ownerId: new Types.ObjectId(userId) });

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.checkOwnership(encounterId, userId);

        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
      });

      it('should return false for non-owner', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const userId = 'differentuserid123456';
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.checkOwnership(encounterId, userId);

        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
      });
    });

    describe('shareEncounter', () => {
      it('should share encounter with specified users', async () => {
        const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;
        const userIds = [ENCOUNTER_TEST_CONSTANTS.mockOwnerId, ENCOUNTER_TEST_CONSTANTS.mockCharacterId]; // Use valid ObjectIds
        const mockEncounter = createTestEncounter();

        const mockFindById = jest.fn().mockResolvedValue(mockEncounter);
        const mockSave = jest.fn().mockResolvedValue(mockEncounter);

        mockEncounter.save = mockSave;
        (Encounter.findById as jest.Mock) = mockFindById;

        const result = await EncounterService.shareEncounter(encounterId, userIds);

        expect(result.success).toBe(true);
        expect(mockEncounter.sharedWith).toHaveLength(2);
        expect(mockEncounter.sharedWith.map(id => id.toString())).toEqual(
          expect.arrayContaining([userIds[0], userIds[1]])
        );
        expect(mockSave).toHaveBeenCalled();
      });
    });
  });

  describe('Validation and Data Sanitization', () => {
    describe('validateEncounterData', () => {
      it('should validate valid encounter data', async () => {
        const validData = createTestEncounterInput();

        const result = await EncounterService.validateEncounterData(validData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(expect.objectContaining(validData));
      });

      it('should reject invalid encounter data', async () => {
        const invalidData = { name: '' } as CreateEncounterInput;

        const result = await EncounterService.validateEncounterData(invalidData);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ENCOUNTER_VALIDATION_ERROR');
      });

      it('should sanitize encounter data', async () => {
        const dataWithScript = createTestEncounterInput({
          name: '<script>alert("xss")</script>Safe Name',
          description: '<div onclick="malicious()">Description</div>',
        });

        const result = await EncounterService.validateEncounterData(dataWithScript);

        expect(result.success).toBe(true);
        expect(result.data?.name).not.toContain('<script>');
        expect(result.data?.description).not.toContain('onclick');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const encounterId = ENCOUNTER_TEST_CONSTANTS.mockEncounterId;

      const mockFindById = jest.fn().mockRejectedValue(new Error('Connection failed'));
      (Encounter.findById as jest.Mock) = mockFindById;

      const result = await EncounterService.getEncounterById(encounterId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_RETRIEVAL_FAILED');
      expect(result.error?.statusCode).toBe(500);
    });

    it('should handle validation errors from model', async () => {
      const invalidData = createTestEncounterInput();

      const mockCreate = jest.fn().mockRejectedValue(
        new Error('Validation failed: name is required')
      );
      (Encounter.createEncounter as jest.Mock) = mockCreate;

      const result = await EncounterService.createEncounter(invalidData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_CREATION_FAILED');
    });
  });
});