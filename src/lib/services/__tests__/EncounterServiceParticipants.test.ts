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
      const participantData = {
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
      };

      const mockEncounter = createTestEncounter();
      mockEncounter.addParticipant = jest.fn();
      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await EncounterServiceParticipants.addParticipant(
        encounterId,
        participantData
      );

      expectSuccess(result, mockEncounter);
      expect(mockEncounter.addParticipant).toHaveBeenCalledWith(
        expect.objectContaining(participantData)
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle invalid participant data', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const invalidParticipantData = {
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
      };

      const result = await EncounterServiceParticipants.addParticipant(
        encounterId,
        invalidParticipantData
      );

      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle encounter not found', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantData = createTestParticipant();

      setupBasicMock('findById', null);

      const result = await EncounterServiceParticipants.addParticipant(
        encounterId,
        participantData
      );

      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });
  });

  describe('removeParticipant', () => {
    it('should successfully remove a participant', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;

      const mockEncounter = createTestEncounter();
      mockEncounter.removeParticipant = jest.fn().mockReturnValue(true);
      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await EncounterServiceParticipants.removeParticipant(
        encounterId,
        participantId
      );

      expectSuccess(result, mockEncounter);
      expect(mockEncounter.removeParticipant).toHaveBeenCalledWith(participantId);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle participant not found', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;

      const mockEncounter = createTestEncounter();
      mockEncounter.removeParticipant = jest.fn().mockReturnValue(false);
      setupBasicMock('findById', mockEncounter);

      const result = await EncounterServiceParticipants.removeParticipant(
        encounterId,
        participantId
      );

      expectError(result, 'PARTICIPANT_NOT_FOUND');
    });

    it('should handle encounter not found', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;

      setupBasicMock('findById', null);

      const result = await EncounterServiceParticipants.removeParticipant(
        encounterId,
        participantId
      );

      expectError(result, 'ENCOUNTER_NOT_FOUND');
    });
  });

  describe('updateParticipant', () => {
    it('should successfully update a participant', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;
      const updateData = {
        name: 'Updated Character',
        hitPoints: 30,
        armorClass: 16,
      };

      const mockEncounter = createTestEncounter();
      mockEncounter.updateParticipant = jest.fn().mockReturnValue(true);
      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await EncounterServiceParticipants.updateParticipant(
        encounterId,
        participantId,
        updateData
      );

      expectSuccess(result, mockEncounter);
      expect(mockEncounter.updateParticipant).toHaveBeenCalledWith(
        participantId,
        expect.objectContaining(updateData)
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle participant not found for update', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;
      const updateData = { name: 'Updated Character' };

      const mockEncounter = createTestEncounter();
      mockEncounter.updateParticipant = jest.fn().mockReturnValue(false);
      setupBasicMock('findById', mockEncounter);

      const result = await EncounterServiceParticipants.updateParticipant(
        encounterId,
        participantId,
        updateData
      );

      expectError(result, 'PARTICIPANT_NOT_FOUND');
    });

    it('should handle encounter not found for update', async () => {
      const encounterId = ADDITIONAL_TEST_CONSTANTS.VALID_ENCOUNTER_ID;
      const participantId = ADDITIONAL_TEST_CONSTANTS.VALID_CHARACTER_ID;
      const updateData = { name: 'Updated Character' };

      setupBasicMock('findById', null);

      const result = await EncounterServiceParticipants.updateParticipant(
        encounterId,
        participantId,
        updateData
      );

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
      const mockEncounter = createTestEncounter();
      mockEncounter.participants = [
        { characterId: new Types.ObjectId(validParticipantIds[0]), name: 'Character 1' },
        { characterId: new Types.ObjectId(validParticipantIds[1]), name: 'Character 2' },
        { characterId: new Types.ObjectId(validParticipantIds[2]), name: 'Character 3' },
      ] as IParticipantReference[];

      const mockSave = setupBasicMockWithSave(mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        [validParticipantIds[2], validParticipantIds[0], validParticipantIds[1]]
      );

      expectSuccess(result, mockEncounter);
      expect(mockSave).toHaveBeenCalled();
      expect(mockEncounter.participants).toHaveLength(3);
    });

    it('should handle invalid encounter ID format', async () => {
      const result = await EncounterServiceParticipants.reorderParticipants(
        'invalid-id',
        validParticipantIds
      );

      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle empty participant IDs array', async () => {
      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        []
      );

      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle invalid participant ID format', async () => {
      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        ['invalid-id', validParticipantIds[1]]
      );

      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle encounter not found', async () => {
      setupBasicMock('findById', null);

      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        validParticipantIds
      );

      expectError(result, 'ENCOUNTER_NOT_FOUND');
    });

    it('should handle missing participant validation', async () => {
      const mockEncounter = createTestEncounter();
      mockEncounter.participants = [
        { characterId: new Types.ObjectId(validParticipantIds[0]), name: 'Character 1' },
      ] as IParticipantReference[];

      setupBasicMock('findById', mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        [validParticipantIds[0], validParticipantIds[1]] // Second ID doesn't exist
      );

      expectError(result, 'PARTICIPANT_NOT_FOUND');
    });

    it('should handle incomplete participant list validation', async () => {
      const mockEncounter = createTestEncounter();
      mockEncounter.participants = [
        { characterId: new Types.ObjectId(validParticipantIds[0]), name: 'Character 1' },
        { characterId: new Types.ObjectId(validParticipantIds[1]), name: 'Character 2' },
      ] as IParticipantReference[];

      setupBasicMock('findById', mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        [validParticipantIds[0]] // Missing one participant
      );

      expectError(result, 'ENCOUNTER_VALIDATION_ERROR');
    });

    it('should handle database errors during save', async () => {
      const mockEncounter = createTestEncounter();
      mockEncounter.participants = [
        { characterId: new Types.ObjectId(validParticipantIds[0]), name: 'Character 1' },
      ] as IParticipantReference[];

      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      mockEncounter.save = mockSave;
      setupBasicMock('findById', mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(
        validEncounterId,
        [validParticipantIds[0]]
      );

      expectError(result, 'PARTICIPANT_REORDER_FAILED');
    });
  });
});