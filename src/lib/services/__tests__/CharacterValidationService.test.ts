import {
  CharacterValidationService,
  type ValidationContext,
} from '../CharacterValidationService';
import { CharacterDataRecovery } from '../../validations/error-recovery';
import type { CharacterCreation } from '../../validations/character';

// Mock CharacterDataRecovery
jest.mock('../../validations/error-recovery', () => ({
  CharacterDataRecovery: {
    createBackup: jest.fn(),
    validateWithRecovery: jest.fn(),
    generateRecoverySuggestions: jest.fn(),
  },
}));

describe('CharacterValidationService', () => {
  const mockValidCharacter: CharacterCreation = {
    name: 'Test Character',
    type: 'pc',
    race: 'human',
    size: 'medium',
    classes: [{ class: 'fighter', level: 5, hitDie: 10 }],
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    hitPoints: { maximum: 45, current: 45, temporary: 0 },
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 3,
    savingThrows: {
      strength: true,
      dexterity: false,
      constitution: true,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    skills: {},
    equipment: [],
    spells: [],
  };

  const mockValidationContext: ValidationContext = {
    userId: 'user123',
    characterId: 'char123',
    operationType: 'create',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCharacterCreation', () => {
    it('should validate a valid character successfully', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      const result = await CharacterValidationService.validateCharacterCreation(
        mockValidCharacter,
        mockValidationContext
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should handle validation errors with recovery suggestions', async () => {
      const mockErrors = [
        {
          message: 'Name is required',
          field: 'name',
          suggestedFix: 'Please enter a character name',
          autoFixable: false,
        },
      ];

      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: false,
        errors: mockErrors,
        suggestedFixes: {},
      });

      (CharacterDataRecovery.generateRecoverySuggestions as jest.Mock).mockReturnValue([
        'Add a character name to identify your character',
      ]);

      const result = await CharacterValidationService.validateCharacterCreation(
        { ...mockValidCharacter, name: '' },
        mockValidationContext
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.suggestions).toContain('Add a character name to identify your character');
    });

    it('should create backup when data recovery is enabled', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      await CharacterValidationService.validateCharacterCreation(
        mockValidCharacter,
        mockValidationContext,
        { enableDataRecovery: true }
      );

      expect(CharacterDataRecovery.createBackup).toHaveBeenCalledWith(
        expect.any(Object),
        'auto-save',
        'char123'
      );
    });

    it('should skip backup when data recovery is disabled', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      await CharacterValidationService.validateCharacterCreation(
        mockValidCharacter,
        mockValidationContext,
        { enableDataRecovery: false }
      );

      expect(CharacterDataRecovery.createBackup).not.toHaveBeenCalled();
    });

    it('should handle validation process errors gracefully', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockImplementation(() => {
        throw new Error('Validation process failed');
      });

      const result = await CharacterValidationService.validateCharacterCreation(
        mockValidCharacter,
        mockValidationContext
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Validation process failed');
      expect(result.suggestions).toContain('An unexpected error occurred during validation');
    });

    it('should provide auto-fix suggestions when available', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: false,
        errors: [
          {
            message: 'Ability score too low',
            field: 'abilityScores.strength',
            suggestedFix: 'Set to minimum of 8',
            autoFixable: true,
          },
        ],
        suggestedFixes: { 'abilityScores.strength': 8 },
        autoFixableData: { ...mockValidCharacter, abilityScores: { ...mockValidCharacter.abilityScores, strength: 8 } },
      });

      const result = await CharacterValidationService.validateCharacterCreation(
        { ...mockValidCharacter, abilityScores: { ...mockValidCharacter.abilityScores, strength: 0 } },
        mockValidationContext
      );

      expect(result.success).toBe(false);
      expect(result.autoFixable).toBe(true);
      expect(result.autoFixData).toBeDefined();
    });
  });

  describe('validateCharacterUpdate', () => {
    it('should validate character updates successfully', async () => {
      const updateData = { name: 'Updated Name', hitPoints: { current: 40 } };

      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      const result = await CharacterValidationService.validateCharacterUpdate(
        updateData,
        mockValidCharacter,
        { ...mockValidationContext, operationType: 'update' }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate merged character data for updates', async () => {
      const updateData = { hitPoints: { current: 50 } }; // Invalid: exceeds maximum

      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: false,
        errors: [
          {
            message: 'Current HP exceeds maximum',
            field: 'hitPoints.current',
          },
        ],
        suggestedFixes: {},
      });

      const result = await CharacterValidationService.validateCharacterUpdate(
        updateData,
        mockValidCharacter,
        { ...mockValidationContext, operationType: 'update' }
      );

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFieldRealtime', () => {
    it('should validate individual fields successfully', () => {
      const error = CharacterValidationService.validateFieldRealtime(
        'name',
        'Valid Name',
        mockValidCharacter
      );

      expect(error).toBeNull();
    });

    it('should return validation error for invalid field values', () => {
      const error = CharacterValidationService.validateFieldRealtime(
        'name',
        '',
        mockValidCharacter
      );

      expect(error).not.toBeNull();
      expect(error!.message).toContain('at least 1 character');
      expect(error!.suggestedFix).toBeDefined();
    });

    it('should provide auto-fix suggestions for fixable fields', () => {
      const error = CharacterValidationService.validateFieldRealtime(
        'abilityScores.strength',
        0,
        mockValidCharacter
      );

      expect(error).not.toBeNull();
      expect(error!.autoFixable).toBe(true);
      expect(error!.autoFixValue).toBe(8);
    });

    it('should validate context-dependent fields', () => {
      const characterWithCustomRace = { ...mockValidCharacter, race: 'custom' as const };

      const error = CharacterValidationService.validateFieldRealtime(
        'customRace',
        '',
        characterWithCustomRace
      );

      expect(error).not.toBeNull();
      expect(error!.message).toContain('Custom race name is required');
    });

    it('should validate hit points against maximum', () => {
      const error = CharacterValidationService.validateFieldRealtime(
        'hitPoints.current',
        50,
        { ...mockValidCharacter, hitPoints: { maximum: 45, current: 45, temporary: 0 } }
      );

      expect(error).not.toBeNull();
      expect(error!.message).toContain('exceed maximum');
    });
  });

  describe('Character Data Recovery Operations', () => {
    it('should retrieve character backups', () => {
      const mockBackups = [
        {
          id: 'backup1',
          timestamp: new Date(),
          characterId: 'char123',
          data: mockValidCharacter,
          source: 'manual' as const,
          isValid: true,
        },
      ];

      (CharacterDataRecovery.getCharacterBackups as jest.Mock).mockReturnValue(mockBackups);

      const backups = CharacterValidationService.getCharacterBackups('char123');

      expect(backups).toEqual(mockBackups);
      expect(CharacterDataRecovery.getCharacterBackups).toHaveBeenCalledWith('char123');
    });

    it('should restore character from backup', () => {
      (CharacterDataRecovery.restoreFromBackup as jest.Mock).mockReturnValue(mockValidCharacter);

      const result = CharacterValidationService.restoreCharacterFromBackup('backup123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockValidCharacter);
    });

    it('should handle backup restoration errors', () => {
      (CharacterDataRecovery.restoreFromBackup as jest.Mock).mockImplementation(() => {
        throw new Error('Backup not found');
      });

      const result = CharacterValidationService.restoreCharacterFromBackup('invalid-backup');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('restore-backup');
    });

    it('should create character backup', () => {
      const mockBackup = {
        id: 'backup123',
        timestamp: new Date(),
        characterId: 'char123',
        data: mockValidCharacter,
        source: 'manual' as const,
        isValid: true,
      };

      (CharacterDataRecovery.createBackup as jest.Mock).mockReturnValue(mockBackup);

      const backup = CharacterValidationService.createCharacterBackup(mockValidCharacter, 'char123');

      expect(backup).toEqual(mockBackup);
      expect(CharacterDataRecovery.createBackup).toHaveBeenCalledWith(
        mockValidCharacter,
        'manual',
        'char123'
      );
    });
  });

  describe('Validation Options', () => {
    it('should respect consistency check settings', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      const result = await CharacterValidationService.validateCharacterCreation(
        mockValidCharacter,
        mockValidationContext,
        { enableConsistencyChecks: false }
      );

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should skip business rule validation when disabled', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      const result = await CharacterValidationService.validateCharacterCreation(
        mockValidCharacter,
        mockValidationContext,
        { validateBusinessRules: false }
      );

      expect(result.success).toBe(true);
    });

    it('should handle strict mode validation', async () => {
      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      const result = await CharacterValidationService.validateCharacterImport(
        mockValidCharacter,
        mockValidationContext
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple characters', async () => {
      const charactersData = [mockValidCharacter, { ...mockValidCharacter, name: 'Character 2' }];

      (CharacterDataRecovery.validateWithRecovery as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        suggestedFixes: {},
      });

      const results = await CharacterValidationService.validateMultipleCharacters(
        charactersData,
        { userId: 'user123', operationType: 'create' }
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should handle mixed validation results in batch', async () => {
      const charactersData = [
        mockValidCharacter,
        { ...mockValidCharacter, name: '' }, // Invalid
      ];

      (CharacterDataRecovery.validateWithRecovery as jest.Mock)
        .mockReturnValueOnce({
          isValid: true,
          errors: [],
          suggestedFixes: {},
        })
        .mockReturnValueOnce({
          isValid: false,
          errors: [{ message: 'Name required', field: 'name' }],
          suggestedFixes: {},
        });

      (CharacterDataRecovery.generateRecoverySuggestions as jest.Mock).mockReturnValue([
        'Add a character name',
      ]);

      const results = await CharacterValidationService.validateMultipleCharacters(
        charactersData,
        { userId: 'user123', operationType: 'create' }
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('Error Message Generation', () => {
    it('should generate contextual suggested fixes', () => {
      const testCases = [
        { field: 'name', expected: 'Character names should be 1-100 characters' },
        { field: 'abilityScores.strength', expected: 'Ability scores should be between 1-30' },
        { field: 'hitPoints.current', expected: 'Hit points should be positive' },
        { field: 'armorClass', expected: 'Armor Class should be at least 10' },
        { field: 'level', expected: 'Character levels should be between 1-20' },
        { field: 'race', expected: 'Please select a valid race' },
        { field: 'class', expected: 'Please select valid character classes' },
        { field: 'unknown', expected: 'Please verify this field meets the requirements' },
      ];

      testCases.forEach(({ field, expected }) => {
        const error = CharacterValidationService.validateFieldRealtime(field, 'invalid', mockValidCharacter);
        if (error?.suggestedFix) {
          expect(error.suggestedFix).toContain(expected.split(' ')[0]);
        }
      });
    });

    it('should identify auto-fixable fields correctly', () => {
      const autoFixableFields = [
        'abilityScores.strength',
        'abilityScores.dexterity',
        'level',
        'hitPoints.temporary',
      ];

      const nonAutoFixableFields = [
        'name',
        'race',
        'class',
        'customRace',
      ];

      autoFixableFields.forEach(field => {
        const error = CharacterValidationService.validateFieldRealtime(field, -1, mockValidCharacter);
        if (error) {
          expect(error.autoFixable).toBe(true);
        }
      });

      nonAutoFixableFields.forEach(field => {
        const error = CharacterValidationService.validateFieldRealtime(field, '', mockValidCharacter);
        if (error) {
          expect(error.autoFixable).toBe(false);
        }
      });
    });

    it('should generate appropriate auto-fix values', () => {
      const testCases = [
        { field: 'abilityScores.strength', value: 0, expected: 8 },
        { field: 'abilityScores.strength', value: 31, expected: 20 },
        { field: 'level', value: 0, expected: 1 },
        { field: 'level', value: 25, expected: 20 },
        { field: 'hitPoints.temporary', value: -5, expected: 0 },
      ];

      testCases.forEach(({ field, value, expected }) => {
        const error = CharacterValidationService.validateFieldRealtime(field, value, mockValidCharacter);
        if (error?.autoFixable) {
          expect(error.autoFixValue).toBe(expected);
        }
      });
    });
  });
});