/**
 * @jest-environment jsdom
 */
import { buildExportData, generateExportFilename, createDownloadLink } from '../exportUtils';
import {
  createEncounterWithParticipants,
  createActiveEncounter,
  createParticipantWithConditions,
  setupDOMMocks,
  resetDOMMocks
} from './__test-helpers__/combatTestHelpers';

describe('exportUtils', () => {
  let mockElements: ReturnType<typeof setupDOMMocks>;

  beforeEach(() => {
    mockElements = setupDOMMocks();
  });

  afterEach(() => {
    resetDOMMocks();
  });

  describe('buildExportData', () => {
    it('should build export data with correct format', () => {
      const encounter = createEncounterWithParticipants(5, 1);
      encounter.name = 'Test Encounter';

      // Use the participant with conditions
      encounter.participants = [createParticipantWithConditions(['Blessed', 'Haste'])];

      const result = buildExportData(encounter);

      expect(result.encounterName).toBe('Test Encounter');
      expect(result.round).toBe(5);
      expect(result.turn).toBe(1);
      expect(result.initiativeOrder).toHaveLength(2);
      expect(result.initiativeOrder[0]).toEqual({
        name: 'Conditioned Character',
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
      const encounter = createActiveEncounter();
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
      const encounter = createActiveEncounter();
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
      expect(mockElements.mockLink.href).toBe('mock-url');
      expect(mockElements.mockLink.download).toBe(filename);
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElements.mockLink);
      expect(mockElements.mockLink.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(mockElements.mockLink);
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