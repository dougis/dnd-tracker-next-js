/**
 * @jest-environment jsdom
 */
import { buildShareText, copyToClipboard } from '../shareUtils';
import {
  createEncounterWithParticipants,
  createActiveEncounter,
  setupDOMMocks,
  resetDOMMocks
} from './__test-helpers__/combatTestHelpers';

describe('shareUtils', () => {
  let mockElements: ReturnType<typeof setupDOMMocks>;

  beforeEach(() => {
    mockElements = setupDOMMocks();
  });

  afterEach(() => {
    resetDOMMocks();
  });

  describe('buildShareText', () => {
    it('should build share text with correct format', () => {
      const encounter = createEncounterWithParticipants(3, 1);
      encounter.name = 'Test Encounter';

      const result = buildShareText(encounter);

      expect(result).toContain('Initiative Order - Test Encounter (Round 3)');
      expect(result).toContain('20: Character 1 (15/20 HP)');
      expect(result).toContain('→ 15: Character 2 (30/30 HP)');
    });

    it('should handle unknown participants', () => {
      const encounter = createActiveEncounter();
      encounter.participants = []; // No participants

      const result = buildShareText(encounter);

      expect(result).toContain('20: Unknown (Unknown HP)');
      expect(result).toContain('15: Unknown (Unknown HP)');
    });

    it('should show acted indicator for participants who have acted', () => {
      const encounter = createEncounterWithParticipants();
      encounter.combatState.initiativeOrder[0].hasActed = true;

      const result = buildShareText(encounter);

      expect(result).toContain('20: Character 1 (15/20 HP) ✓');
    });
  });

  describe('performance optimization', () => {
    it('should handle large numbers of participants efficiently', () => {
      // Create encounter with many participants to test O(1) lookups
      const encounter = createActiveEncounter(1, 0);
      const participantCount = 100;

      // Create many participants
      encounter.participants = Array.from({ length: participantCount }, (_, i) => ({
        characterId: `participant-${i}`,
        name: `Character ${i}`,
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        armorClass: 15,
        initiative: 20 - i,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: []
      }));

      // Create many initiative entries
      encounter.combatState.initiativeOrder = Array.from({ length: participantCount }, (_, i) => ({
        participantId: `participant-${i}`,
        initiative: 20 - i,
        dexterity: 15,
        hasActed: false
      }));

      const startTime = performance.now();
      const result = buildShareText(encounter);
      const endTime = performance.now();

      // Should complete in reasonable time (less than 100ms for 100 participants)
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100);

      // Verify all participants are included in output
      expect(result).toContain('Character 0');
      expect(result).toContain(`Character ${participantCount - 1}`);

      // Count the number of lines - should have header + participantCount entries
      const lines = result.split('\n').filter(line => line.trim() !== '');
      expect(lines.length).toBe(participantCount + 1); // +1 for header
    });

    it('should maintain consistent performance with Map-based lookups', () => {
      const smallEncounter = createActiveEncounter(1, 0);
      smallEncounter.participants = Array.from({ length: 10 }, (_, i) => ({
        characterId: `participant-${i}`,
        name: `Character ${i}`,
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        armorClass: 15,
        initiative: 20 - i,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: []
      }));

      smallEncounter.combatState.initiativeOrder = Array.from({ length: 10 }, (_, i) => ({
        participantId: `participant-${i}`,
        initiative: 20 - i,
        dexterity: 15,
        hasActed: false
      }));

      const largeEncounter = createActiveEncounter(1, 0);
      largeEncounter.participants = Array.from({ length: 100 }, (_, i) => ({
        characterId: `participant-${i}`,
        name: `Character ${i}`,
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        armorClass: 15,
        initiative: 20 - i,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: []
      }));

      largeEncounter.combatState.initiativeOrder = Array.from({ length: 100 }, (_, i) => ({
        participantId: `participant-${i}`,
        initiative: 20 - i,
        dexterity: 15,
        hasActed: false
      }));

      // Test with small dataset
      const smallStartTime = performance.now();
      buildShareText(smallEncounter);
      const smallEndTime = performance.now();
      const smallTime = smallEndTime - smallStartTime;

      // Test with large dataset
      const largeStartTime = performance.now();
      buildShareText(largeEncounter);
      const largeEndTime = performance.now();
      const largeTime = largeEndTime - largeStartTime;

      // With O(1) Map lookups, the large dataset should not be significantly slower
      // Allow for some variance but it shouldn't be 10x slower
      expect(largeTime).toBeLessThan(smallTime * 10);
    });
  });

  describe('copyToClipboard', () => {
    it('should use navigator.clipboard when available', async () => {
      const testText = 'Test clipboard text';
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

      await copyToClipboard(testText);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
    });

    it('should use fallback when navigator.clipboard is not available', async () => {
      const testText = 'Test clipboard text';
      const originalClipboard = navigator.clipboard;

      // Temporarily remove clipboard support
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true
      });

      await copyToClipboard(testText);

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(mockElements.mockTextArea.value).toBe(testText);
      expect(mockElements.mockTextArea.focus).toHaveBeenCalled();
      expect(mockElements.mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElements.mockTextArea);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockElements.mockTextArea);

      // Restore clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true
      });
    });
  });
});