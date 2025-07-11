import { Types } from 'mongoose';
import { EncounterServiceParticipants } from '../EncounterServiceParticipants';
import { Encounter as _Encounter } from '@/lib/models/encounter';
import type {
  IParticipantReference,
} from '@/lib/models/encounter/interfaces';
import {
  setupBasicMock,
  setupBasicMockWithSave,
  expectSuccess,
  expectError,
} from './test-utils/serviceTestHelpers';
import {
  createTestEncounter,
  createTestParticipant,
  ENCOUNTER_TEST_CONSTANTS,
} from './EncounterService.test-helpers';

// Additional character IDs for reorder tests
const ADDITIONAL_TEST_CONSTANTS = {
  VALID_ENCOUNTER_ID: ENCOUNTER_TEST_CONSTANTS.mockEncounterId,
  VALID_CHARACTER_ID: ENCOUNTER_TEST_CONSTANTS.mockCharacterId,
  VALID_CHARACTER_ID_2: '65f1a2b3c4d5e6f7a8b9c0d6',
  VALID_CHARACTER_ID_3: '65f1a2b3c4d5e6f7a8b9c0d7',
};

// Test helper functions to reduce code duplication
const createValidParticipantData = (overrides = {}) => ({
  characterId: ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID,
  name: 'Test Character',
  type: 'pc' as const,
  maxHitPoints: 25,
  currentHitPoints: 25,
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

const createInvalidParticipantData = () => ({
  characterId: 'invalid-id',
  name: '',
  type: 'pc' as const,
  maxHitPoints: -1,
  currentHitPoints: -1,
  temporaryHitPoints: 0,
  armorClass: -1,
  initiative: 0,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
  position: { x: 0, y: 0 },
});

const testParticipantOperation = async (
  operation: 'add' | 'remove' | 'update',
  encounterId: string,
  participantData: any,
  participantId?: string,
  updateData?: any
) => {
  switch (operation) {
    case 'add':
      return EncounterServiceParticipants.addParticipant(encounterId, participantData);
    case 'remove':
      return EncounterServiceParticipants.removeParticipant(encounterId, participantId!);
    case 'update':
      return EncounterServiceParticipants.updateParticipant(encounterId, participantId!, updateData);
    default:
      throw new Error('Invalid operation');
  }
};

const createMockEncounterWithParticipants = (participantIds: string[]) => {
  const mockEncounter = createTestEncounter();
  mockEncounter.participants = participantIds.map((id, index) => ({
    characterId: new Types.ObjectId(id),
    name: `Character ${index + 1}`,
  })) as IParticipantReference[];
  return mockEncounter;
};

const testReorderOperation = (encounterId: string, participantIds: string[]) =>
  EncounterServiceParticipants.reorderParticipants(encounterId, participantIds);

jest.mock('@/lib/models/encounter', () => ({
  Encounter: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// Mock Types.ObjectId.isValid after importing
const { Types } = require('mongoose');
Types.ObjectId.isValid = jest.fn((id: string) => {
  // Basic ObjectId validation - 24 character hex string
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
});


describe('EncounterServiceParticipants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addParticipant', () => {
    it('should successfully add a participant', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantData = createValidParticipantData();

      const mockEncounter = createTestEncounter();
      mockEncounter.addParticipant = jest.fn();
      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await testParticipantOperation('add', encounterId, participantData);

      expectSuccess(result, mockEncounter);
      expect(mockEncounter.addParticipant).toHaveBeenCalledWith(
        expect.objectContaining(participantData)
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle invalid participant data', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const invalidParticipantData = createInvalidParticipantData();

      const result = await testParticipantOperation('add', encounterId, invalidParticipantData);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle encounter not found', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantData = createTestParticipant();

      setupBasicMock('findById', null);
      const result = await testParticipantOperation('add', encounterId, participantData);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });
  });

  describe('removeParticipant', () => {
    const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
    const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;

    it('should successfully remove a participant', async () => {
      const mockEncounter = createTestEncounter();
      mockEncounter.removeParticipant = jest.fn().mockReturnValue(true);
      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await testParticipantOperation('remove', encounterId, null, participantId);

      expectSuccess(result, mockEncounter);
      expect(mockEncounter.removeParticipant).toHaveBeenCalledWith(participantId);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle participant not found', async () => {
      const mockEncounter = createTestEncounter();
      mockEncounter.removeParticipant = jest.fn().mockReturnValue(false);
      setupBasicMock('findById', mockEncounter);

      const result = await testParticipantOperation('remove', encounterId, null, participantId);
      expectError(result, 'PARTICIPANT_NOT_FOUND');
    });

    it('should handle encounter not found', async () => {
      setupBasicMock('findById', null);
      const result = await testParticipantOperation('remove', encounterId, null, participantId);
      expectError(result, 'ENCOUNTER_NOT_FOUND');
    });
  });

  describe('updateParticipant', () => {
    const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
    const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;

    it('should successfully update a participant', async () => {
      const updateData = { name: 'Updated Character', hitPoints: 30, armorClass: 16 };
      const mockEncounter = createTestEncounter();
      mockEncounter.updateParticipant = jest.fn().mockReturnValue(true);
      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await testParticipantOperation('update', encounterId, null, participantId, updateData);

      expectSuccess(result, mockEncounter);
      expect(mockEncounter.updateParticipant).toHaveBeenCalledWith(
        participantId,
        expect.objectContaining(updateData)
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle participant not found for update', async () => {
      const updateData = { name: 'Updated Character' };
      const mockEncounter = createTestEncounter();
      mockEncounter.updateParticipant = jest.fn().mockReturnValue(false);
      setupBasicMock('findById', mockEncounter);

      const result = await testParticipantOperation('update', encounterId, null, participantId, updateData);
      expectError(result, 'PARTICIPANT_NOT_FOUND');
    });

    it('should handle encounter not found for update', async () => {
      const updateData = { name: 'Updated Character' };
      setupBasicMock('findById', null);

      const result = await testParticipantOperation('update', encounterId, null, participantId, updateData);
      expectError(result, 'ENCOUNTER_NOT_FOUND');
    });
  });

  describe('reorderParticipants', () => {
    const validEncounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
    const validParticipantIds = [
      ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID,
      ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID_2,
      ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID_3,
    ];

    it('should successfully reorder participants', async () => {
      const mockEncounter = createMockEncounterWithParticipants(validParticipantIds);
      const mockSave = setupBasicMockWithSave(mockEncounter);
      const reorderedIds = [validParticipantIds[2], validParticipantIds[0], validParticipantIds[1]];

      const result = await testReorderOperation(validEncounterId, reorderedIds);

      expectSuccess(result, mockEncounter);
      expect(mockSave).toHaveBeenCalled();
      expect(mockEncounter.participants).toHaveLength(3);
    });

    it('should handle invalid encounter ID format', async () => {
      const result = await testReorderOperation('invalid-id', validParticipantIds);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle empty participant IDs array', async () => {
      const result = await testReorderOperation(validEncounterId, []);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle invalid participant ID format', async () => {
      const result = await testReorderOperation(validEncounterId, ['invalid-id', validParticipantIds[1]]);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle encounter not found', async () => {
      setupBasicMock('findById', null);
      const result = await testReorderOperation(validEncounterId, validParticipantIds);
      expectError(result, 'ENCOUNTER_NOT_FOUND');
    });

    it('should handle missing participant validation', async () => {
      const mockEncounter = createMockEncounterWithParticipants([validParticipantIds[0]]);
      setupBasicMock('findById', mockEncounter);

      const result = await testReorderOperation(validEncounterId, [validParticipantIds[0], validParticipantIds[1]]);
      expectError(result, 'PARTICIPANT_NOT_FOUND');
    });

    it('should handle incomplete participant list validation', async () => {
      const mockEncounter = createMockEncounterWithParticipants([validParticipantIds[0], validParticipantIds[1]]);
      setupBasicMock('findById', mockEncounter);

      const result = await testReorderOperation(validEncounterId, [validParticipantIds[0]]);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle database errors during save', async () => {
      const mockEncounter = createMockEncounterWithParticipants([validParticipantIds[0]]);
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      mockEncounter.save = mockSave;
      setupBasicMock('findById', mockEncounter);

      const result = await testReorderOperation(validEncounterId, [validParticipantIds[0]]);
      expectError(result, 'PARTICIPANT_REORDER_FAILED');
    });
  });

  describe('addParticipantsBulk', () => {
    const validEncounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
    const createBulkParticipantsData = () => [
      createValidParticipantData({
        characterId: ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID,
        name: 'Character 1'
      }),
      createValidParticipantData({
        characterId: ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID_2,
        name: 'Character 2'
      }),
      createValidParticipantData({
        characterId: ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID_3,
        name: 'Character 3'
      }),
    ];

    const testBulkAddOperation = async (encounterId: string, participantsData: any[]) => {
      return await EncounterServiceParticipants.addParticipantsBulk(encounterId, participantsData);
    };

    it('should successfully add multiple participants', async () => {
      const mockEncounter = createTestEncounter({
        _id: new Types.ObjectId(validEncounterId),
        participants: []
      });
      const addParticipantSpy = jest.spyOn(mockEncounter, 'addParticipant');
      setupBasicMockWithSave(mockEncounter);

      const participantsData = createBulkParticipantsData();
      const result = await testBulkAddOperation(validEncounterId, participantsData);

      expectSuccess(result);
      expect(addParticipantSpy).toHaveBeenCalledTimes(3);
      expect(mockEncounter.save).toHaveBeenCalledTimes(1);
    });

    it('should handle encounter not found', async () => {
      setupBasicMock('findById', null);
      const participantsData = createBulkParticipantsData();

      const result = await testBulkAddOperation(validEncounterId, participantsData);
      expectError(result, 'ENCOUNTER_NOT_FOUND');
    });

    it('should handle empty participants array', async () => {
      const result = await testBulkAddOperation(validEncounterId, []);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should validate all participants and reject invalid ones', async () => {
      const mockEncounter = createTestEncounter({
        _id: new Types.ObjectId(validEncounterId),
        participants: []
      });
      setupBasicMockWithSave(mockEncounter);

      const mixedParticipantsData = [
        createValidParticipantData({ name: 'Valid Character 1' }),
        createInvalidParticipantData(), // Invalid participant
        createValidParticipantData({ name: 'Valid Character 2' }),
      ];

      const result = await testBulkAddOperation(validEncounterId, mixedParticipantsData);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle invalid encounter ID format', async () => {
      const participantsData = createBulkParticipantsData();
      const result = await testBulkAddOperation('invalid-id', participantsData);
      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle database errors during save', async () => {
      const mockEncounter = createTestEncounter({
        _id: new Types.ObjectId(validEncounterId),
        participants: []
      });
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      mockEncounter.save = mockSave;
      setupBasicMock('findById', mockEncounter);

      const participantsData = createBulkParticipantsData();
      const result = await testBulkAddOperation(validEncounterId, participantsData);
      expectError(result, 'PARTICIPANT_ADD_FAILED');
    });
  });
});