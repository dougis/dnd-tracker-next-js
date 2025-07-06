/**
 * @jest-environment jsdom
 */
import { buildShareText, copyToClipboard } from '../shareUtils';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock document methods
const mockTextArea = {
  value: '',
  focus: jest.fn(),
  select: jest.fn(),
};
document.createElement = jest.fn().mockReturnValue(mockTextArea);
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();
document.execCommand = jest.fn();

describe('shareUtils', () => {
  beforeEach(() => {
    (navigator.clipboard.writeText as jest.Mock).mockClear();
    (document.createElement as jest.Mock).mockClear();
    (document.body.appendChild as jest.Mock).mockClear();
    (document.body.removeChild as jest.Mock).mockClear();
    (document.execCommand as jest.Mock).mockClear();
  });

  describe('buildShareText', () => {
    it('should build share text with correct format', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.name = 'Test Encounter';
      encounter.combatState.currentRound = 3;
      encounter.combatState.currentTurn = 1;

      // Add participants
      encounter.participants = [
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

      const result = buildShareText(encounter);

      expect(result).toContain('Initiative Order - Test Encounter (Round 3)');
      expect(result).toContain('20: Character 1 (15/20 HP)');
      expect(result).toContain('→ 15: Character 2 (30/30 HP)');
    });

    it('should handle unknown participants', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.participants = []; // No participants

      const result = buildShareText(encounter);

      expect(result).toContain('20: Unknown (Unknown HP)');
      expect(result).toContain('15: Unknown (Unknown HP)');
    });

    it('should show acted indicator for participants who have acted', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.combatState.initiativeOrder[0].hasActed = true;

      encounter.participants = [
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
        }
      ];

      const result = buildShareText(encounter);

      expect(result).toContain('20: Character 1 (15/20 HP) ✓');
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
      expect(mockTextArea.value).toBe(testText);
      expect(mockTextArea.focus).toHaveBeenCalled();
      expect(mockTextArea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockTextArea);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockTextArea);

      // Restore clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true
      });
    });
  });
});