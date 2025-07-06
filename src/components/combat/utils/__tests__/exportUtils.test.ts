/**
 * @jest-environment jsdom
 */
import { buildExportData, generateExportFilename, createDownloadLink } from '../exportUtils';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

// Mock DOM methods
const mockLink = {
  href: '',
  download: '',
  click: jest.fn(),
};

document.createElement = jest.fn().mockReturnValue(mockLink);
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Mock URL API
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Blob
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
})) as any;

describe('exportUtils', () => {
  beforeEach(() => {
    (document.createElement as jest.Mock).mockClear();
    (document.body.appendChild as jest.Mock).mockClear();
    (document.body.removeChild as jest.Mock).mockClear();
    (URL.createObjectURL as jest.Mock).mockClear();
    (URL.revokeObjectURL as jest.Mock).mockClear();
    (global.Blob as jest.Mock).mockClear();
    mockLink.click.mockClear();
  });

  describe('buildExportData', () => {
    it('should build export data with correct format', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.name = 'Test Encounter';
      encounter.combatState.currentRound = 5;
      encounter.combatState.currentTurn = 1;

      encounter.participants = [
        {
          characterId: PARTICIPANT_IDS.FIRST,
          name: 'Character 1',
          type: 'Player',
          maxHitPoints: 25,
          currentHitPoints: 20,
          temporaryHitPoints: 5,
          armorClass: 16,
          initiative: 18,
          isPlayer: true,
          isVisible: true,
          notes: 'Test notes',
          conditions: ['Blessed', 'Haste']
        }
      ];

      const result = buildExportData(encounter);

      expect(result.encounterName).toBe('Test Encounter');
      expect(result.round).toBe(5);
      expect(result.turn).toBe(1);
      expect(result.initiativeOrder).toHaveLength(2);
      expect(result.initiativeOrder[0]).toEqual({
        name: 'Character 1',
        initiative: 20,
        dexterity: 15,
        hasActed: false,
        hitPoints: '20/25',
        armorClass: 16,
        conditions: ['Blessed', 'Haste']
      });
      expect(result.exportedAt).toBeDefined();
      expect(new Date(result.exportedAt)).toBeInstanceOf(Date);
    });

    it('should handle unknown participants', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.participants = []; // No participants

      const result = buildExportData(encounter);

      expect(result.initiativeOrder[0]).toEqual({
        name: 'Unknown',
        initiative: 20,
        dexterity: 15,
        hasActed: false,
        hitPoints: 'Unknown',
        armorClass: 'Unknown',
        conditions: []
      });
    });

    it('should include hasActed status', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.combatState.initiativeOrder[0].hasActed = true;
      encounter.participants = [];

      const result = buildExportData(encounter);

      expect(result.initiativeOrder[0].hasActed).toBe(true);
    });
  });

  describe('generateExportFilename', () => {
    it('should generate valid filename with encounter name and round', () => {
      const result = generateExportFilename('My Test Encounter!', 3);

      expect(result).toBe('my_test_encounter__initiative_round_3.json');
    });

    it('should handle special characters', () => {
      const result = generateExportFilename('Encounter #1 - Boss Fight!', 10);

      expect(result).toBe('encounter__1___boss_fight__initiative_round_10.json');
    });

    it('should handle empty encounter name', () => {
      const result = generateExportFilename('', 1);

      expect(result).toBe('_initiative_round_1.json');
    });
  });

  describe('createDownloadLink', () => {
    it('should create and trigger download', () => {
      const testData = { test: 'data' };
      const filename = 'test-file.json';

      createDownloadLink(testData, filename);

      expect(global.Blob).toHaveBeenCalledWith(
        [JSON.stringify(testData, null, 2)],
        { type: 'application/json' }
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('mock-url');
      expect(mockLink.download).toBe(filename);
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('should handle complex data objects', () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { key: 'value' },
        number: 42,
        boolean: true
      };

      createDownloadLink(complexData, 'complex.json');

      expect(global.Blob).toHaveBeenCalledWith(
        [JSON.stringify(complexData, null, 2)],
        { type: 'application/json' }
      );
    });
  });
});