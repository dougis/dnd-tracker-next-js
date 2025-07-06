import { findParticipantById } from '../participantUtils';
import { PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('participantUtils', () => {
  describe('findParticipantById', () => {
    const mockParticipants = [
      {
        characterId: PARTICIPANT_IDS.FIRST,
        name: 'Character 1',
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 15,
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
        name: 'Character 2',
        type: 'NPC',
        maxHitPoints: 30,
        currentHitPoints: 30,
        temporaryHitPoints: 0,
        armorClass: 14,
        initiative: 15,
        isPlayer: false,
        isVisible: true,
        notes: '',
        conditions: []
      }
    ];

    it('should find participant by string ID', () => {
      const result = findParticipantById(mockParticipants, PARTICIPANT_IDS.FIRST.toString());

      expect(result).toBeDefined();
      expect(result?.name).toBe('Character 1');
      expect(result?.characterId).toBe(PARTICIPANT_IDS.FIRST);
    });

    it('should find participant by ObjectId', () => {
      const result = findParticipantById(mockParticipants, PARTICIPANT_IDS.SECOND);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Character 2');
      expect(result?.characterId).toBe(PARTICIPANT_IDS.SECOND);
    });

    it('should return undefined for non-existent participant', () => {
      const result = findParticipantById(mockParticipants, 'non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should handle empty participants array', () => {
      const result = findParticipantById([], PARTICIPANT_IDS.FIRST);

      expect(result).toBeUndefined();
    });

    it('should handle case where participant ID has different type', () => {
      const result = findParticipantById(mockParticipants, 12345);

      expect(result).toBeUndefined();
    });

    it('should be case sensitive for string comparisons', () => {
      const result = findParticipantById(mockParticipants, PARTICIPANT_IDS.FIRST.toString().toUpperCase());

      expect(result).toBeUndefined();
    });
  });
});