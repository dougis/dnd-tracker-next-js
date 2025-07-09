import { EncounterServiceParticipants } from '../EncounterServiceParticipants';
import { Encounter } from '@/lib/models/encounter';
import { EncounterValidationError, EncounterNotFoundError, ParticipantNotFoundError } from '../EncounterServiceErrors';
import { testDataFactories } from './testDataFactories';

// Mock the Encounter model
jest.mock('@/lib/models/encounter');
const mockEncounter = Encounter as jest.Mocked<typeof Encounter>;

describe('EncounterServiceParticipants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reorderParticipants', () => {
    const mockEncounterId = '507f1f77bcf86cd799439011';
    const mockParticipantIds = ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'];
    
    let mockEncounterDoc: any;

    beforeEach(() => {
      mockEncounterDoc = testDataFactories.createEncounter({
        _id: mockEncounterId,
        participants: [
          testDataFactories.createParticipant({
            characterId: '507f1f77bcf86cd799439012',
            name: 'Test Participant 1',
          }),
          testDataFactories.createParticipant({
            characterId: '507f1f77bcf86cd799439013',
            name: 'Test Participant 2',
          }),
        ],
      });
      
      mockEncounterDoc.save = jest.fn().mockResolvedValue(mockEncounterDoc);
    });

    describe('Input Validation', () => {
      it('should throw EncounterValidationError for invalid encounter ID format', async () => {
        const result = await EncounterServiceParticipants.reorderParticipants(
          'invalid-id',
          mockParticipantIds
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid ID format provided',
          statusCode: 400
        }));
      });

      it('should throw EncounterValidationError for empty participant IDs array', async () => {
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          []
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid ID format provided',
          statusCode: 400
        }));
      });

      it('should throw EncounterValidationError for null participant IDs', async () => {
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          null as any
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('Participant IDs must be a non-empty array')
        }));
      });

      it('should throw EncounterValidationError for participant ID with invalid format', async () => {
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          ['invalid-id', '507f1f77bcf86cd799439013']
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('Invalid participant ID format: invalid-id')
        }));
      });
    });

    describe('Encounter Retrieval', () => {
      it('should throw EncounterNotFoundError when encounter does not exist', async () => {
        mockEncounter.findById.mockResolvedValue(null);

        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          mockParticipantIds
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('Encounter not found')
        }));
      });

      it('should find encounter by ID', async () => {
        mockEncounter.findById.mockResolvedValue(mockEncounterDoc);

        await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          mockParticipantIds
        );

        expect(mockEncounter.findById).toHaveBeenCalledWith(mockEncounterId);
      });
    });

    describe('Participant Validation', () => {
      beforeEach(() => {
        mockEncounter.findById.mockResolvedValue(mockEncounterDoc);
      });

      it('should throw ParticipantNotFoundError when participant ID does not exist in encounter', async () => {
        const nonExistentId = '507f1f77bcf86cd799439999';
        
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          [mockParticipantIds[0], nonExistentId]
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining(`Participant IDs not found: ${nonExistentId}`)
        }));
      });

      it('should throw EncounterValidationError when not all participants are included', async () => {
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          [mockParticipantIds[0]] // Missing one participant
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('All participants must be included in reorder')
        }));
      });

      it('should throw EncounterValidationError when too many participants are included', async () => {
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          [...mockParticipantIds, '507f1f77bcf86cd799439014'] // Extra participant
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('All participants must be included in reorder')
        }));
      });
    });

    describe('Successful Reordering', () => {
      beforeEach(() => {
        mockEncounter.findById.mockResolvedValue(mockEncounterDoc);
      });

      it('should successfully reorder participants', async () => {
        const reorderedIds = [mockParticipantIds[1], mockParticipantIds[0]]; // Reverse order
        
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          reorderedIds
        );

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockEncounterDoc);
      });

      it('should update encounter participants in correct order', async () => {
        const reorderedIds = [mockParticipantIds[1], mockParticipantIds[0]]; // Reverse order
        
        await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          reorderedIds
        );

        expect(mockEncounterDoc.participants).toHaveLength(2);
        expect(mockEncounterDoc.participants[0].characterId.toString()).toBe(reorderedIds[0]);
        expect(mockEncounterDoc.participants[1].characterId.toString()).toBe(reorderedIds[1]);
      });

      it('should save the encounter after reordering', async () => {
        await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          mockParticipantIds
        );

        expect(mockEncounterDoc.save).toHaveBeenCalledTimes(1);
      });

      it('should maintain same order when no change is needed', async () => {
        const originalOrder = mockEncounterDoc.participants.map((p: any) => p.characterId.toString());
        
        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          originalOrder
        );

        expect(result.success).toBe(true);
        expect(mockEncounterDoc.participants[0].characterId.toString()).toBe(originalOrder[0]);
        expect(mockEncounterDoc.participants[1].characterId.toString()).toBe(originalOrder[1]);
      });
    });

    describe('Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        mockEncounter.findById.mockRejectedValue(new Error('Database connection failed'));

        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          mockParticipantIds
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('Failed to reorder participants')
        }));
      });

      it('should handle save errors gracefully', async () => {
        mockEncounter.findById.mockResolvedValue(mockEncounterDoc);
        mockEncounterDoc.save.mockRejectedValue(new Error('Save failed'));

        const result = await EncounterServiceParticipants.reorderParticipants(
          mockEncounterId,
          mockParticipantIds
        );

        expect(result.success).toBe(false);
        expect(result.error).toEqual(expect.objectContaining({
          message: expect.stringContaining('Failed to reorder participants')
        }));
      });
    });
  });

  describe('Helper Methods', () => {
    describe('validateReorderInputs', () => {
      it('should validate encounter ID format', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateReorderInputs('invalid-id', ['507f1f77bcf86cd799439012']);
        }).toThrow(EncounterValidationError);
      });

      it('should validate participant IDs array is not empty', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateReorderInputs('507f1f77bcf86cd799439011', []);
        }).toThrow(EncounterValidationError);
      });

      it('should validate each participant ID format', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateReorderInputs(
            '507f1f77bcf86cd799439011',
            ['507f1f77bcf86cd799439012', 'invalid-id']
          );
        }).toThrow(EncounterValidationError);
      });

      it('should pass validation with valid inputs', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateReorderInputs(
            '507f1f77bcf86cd799439011',
            ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
          );
        }).not.toThrow();
      });
    });

    describe('validateParticipantReorder', () => {
      let mockEncounterDoc: any;

      beforeEach(() => {
        mockEncounterDoc = testDataFactories.createEncounter({
          participants: [
            testDataFactories.createParticipant({
              characterId: '507f1f77bcf86cd799439012',
            }),
            testDataFactories.createParticipant({
              characterId: '507f1f77bcf86cd799439013',
            }),
          ],
        });
      });

      it('should throw ParticipantNotFoundError for missing participant', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateParticipantReorder(
            mockEncounterDoc,
            ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439999']
          );
        }).toThrow(ParticipantNotFoundError);
      });

      it('should throw EncounterValidationError for incorrect participant count', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateParticipantReorder(
            mockEncounterDoc,
            ['507f1f77bcf86cd799439012'] // Missing one participant
          );
        }).toThrow(EncounterValidationError);
      });

      it('should pass validation with correct participants', () => {
        expect(() => {
          (EncounterServiceParticipants as any).validateParticipantReorder(
            mockEncounterDoc,
            ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
          );
        }).not.toThrow();
      });
    });

    describe('buildReorderedParticipants', () => {
      let mockEncounterDoc: any;

      beforeEach(() => {
        mockEncounterDoc = testDataFactories.createEncounter({
          participants: [
            testDataFactories.createParticipant({
              characterId: '507f1f77bcf86cd799439012',
              name: 'Participant 1',
            }),
            testDataFactories.createParticipant({
              characterId: '507f1f77bcf86cd799439013',
              name: 'Participant 2',
            }),
          ],
        });
      });

      it('should build reordered participants array', () => {
        const reorderedIds = ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439012'];
        
        const result = (EncounterServiceParticipants as any).buildReorderedParticipants(
          mockEncounterDoc,
          reorderedIds
        );

        expect(result).toHaveLength(2);
        expect(result[0].characterId.toString()).toBe('507f1f77bcf86cd799439013');
        expect(result[1].characterId.toString()).toBe('507f1f77bcf86cd799439012');
      });

      it('should filter out null results', () => {
        const reorderedIds = ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'];
        
        const result = (EncounterServiceParticipants as any).buildReorderedParticipants(
          mockEncounterDoc,
          reorderedIds
        );

        expect(result).toHaveLength(2);
        expect(result.every((p: any) => p !== null)).toBe(true);
      });

      it('should maintain participant data integrity', () => {
        const reorderedIds = ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'];
        
        const result = (EncounterServiceParticipants as any).buildReorderedParticipants(
          mockEncounterDoc,
          reorderedIds
        );

        expect(result[0].name).toBe('Participant 1');
        expect(result[1].name).toBe('Participant 2');
      });
    });
  });
});