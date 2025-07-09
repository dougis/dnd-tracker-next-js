import { Types } from 'mongoose';
import { EncounterServiceParticipants } from '../EncounterServiceParticipants';
import { Encounter } from '@/lib/models/encounter';
import { testDataFactories } from './testDataFactories';

jest.mock('@/lib/models/encounter', () => ({
  Encounter: {
    findById: jest.fn(),
  },
}));

const MockedEncounter = jest.mocked(Encounter);

describe('EncounterServiceParticipants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reorderParticipants', () => {
    const encounterId = '64a1b2c3d4e5f6789abcdef0';
    const participantIds = ['64a1b2c3d4e5f6789abcdef1', '64a1b2c3d4e5f6789abcdef2'];

    it('should reorder participants successfully', async () => {
      const mockEncounter = testDataFactories.createEncounter({
        participants: [
          testDataFactories.createParticipant({ characterId: new Types.ObjectId('64a1b2c3d4e5f6789abcdef1') }),
          testDataFactories.createParticipant({ characterId: new Types.ObjectId('64a1b2c3d4e5f6789abcdef2') }),
        ],
      });

      const mockSave = jest.fn().mockResolvedValue(mockEncounter);
      mockEncounter.save = mockSave;

      MockedEncounter.findById.mockResolvedValue(mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, participantIds);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEncounter);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return error when encounter not found', async () => {
      MockedEncounter.findById.mockResolvedValue(null);

      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, participantIds);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
    });

    it('should handle database errors', async () => {
      MockedEncounter.findById.mockRejectedValue(new Error('Database error'));

      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, participantIds);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DATABASE_ERROR');
    });

    it('should validate encounter ID format', async () => {
      const result = await EncounterServiceParticipants.reorderParticipants('invalid-id', participantIds);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate participant IDs are provided', async () => {
      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, []);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate participant ID formats', async () => {
      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, ['invalid-id', '64a1b2c3d4e5f6789abcdef1']);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate all participants exist', async () => {
      const mockEncounter = testDataFactories.createEncounter({
        participants: [
          testDataFactories.createParticipant({ characterId: new Types.ObjectId('64a1b2c3d4e5f6789abcdef1') }),
        ],
      });

      MockedEncounter.findById.mockResolvedValue(mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, [
        '64a1b2c3d4e5f6789abcdef1',
        '64a1b2c3d4e5f6789abcdef9', // Non-existent participant
      ]);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PARTICIPANT_NOT_FOUND');
    });

    it('should validate all participants are included', async () => {
      const mockEncounter = testDataFactories.createEncounter({
        participants: [
          testDataFactories.createParticipant({ characterId: new Types.ObjectId('64a1b2c3d4e5f6789abcdef1') }),
          testDataFactories.createParticipant({ characterId: new Types.ObjectId('64a1b2c3d4e5f6789abcdef2') }),
        ],
      });

      MockedEncounter.findById.mockResolvedValue(mockEncounter);

      const result = await EncounterServiceParticipants.reorderParticipants(encounterId, [
        '64a1b2c3d4e5f6789abcdef1', // Missing second participant
      ]);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});