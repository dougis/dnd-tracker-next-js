/**
 * @jest-environment jsdom
 */

import {
  CharacterDataRecovery,
  useCharacterAutoSave,
} from '../error-recovery';
import type { CharacterCreation } from '../character';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CharacterDataRecovery', () => {
  const mockCharacterData: Partial<CharacterCreation> = {
    name: 'Test Character',
    type: 'pc',
    race: 'human',
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
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Backup Creation and Management', () => {
    it('should create a backup with all required fields', () => {
      const backup = CharacterDataRecovery.createBackup(mockCharacterData, 'manual', 'char123');

      expect(backup.id).toBeDefined();
      expect(backup.timestamp).toBeInstanceOf(Date);
      expect(backup.characterId).toBe('char123');
      expect(backup.data).toEqual(mockCharacterData);
      expect(backup.source).toBe('manual');
      expect(backup.isValid).toBe(true);
    });

    it('should save backup to localStorage', () => {
      CharacterDataRecovery.createBackup(mockCharacterData, 'auto-save');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dnd_character_backups',
        expect.any(String)
      );
    });

    it('should retrieve all backups from localStorage', () => {
      const backup1 = CharacterDataRecovery.createBackup(mockCharacterData, 'manual', 'char1');
      const backup2 = CharacterDataRecovery.createBackup(mockCharacterData, 'auto-save', 'char2');

      const allBackups = CharacterDataRecovery.getAllBackups();

      expect(allBackups).toHaveLength(2);
      expect(allBackups[0].id).toBe(backup1.id);
      expect(allBackups[1].id).toBe(backup2.id);
    });

    it('should filter backups by character ID', () => {
      CharacterDataRecovery.createBackup(mockCharacterData, 'manual', 'char1');
      CharacterDataRecovery.createBackup(mockCharacterData, 'auto-save', 'char2');
      CharacterDataRecovery.createBackup(mockCharacterData, 'manual', 'char1');

      const char1Backups = CharacterDataRecovery.getCharacterBackups('char1');
      const char2Backups = CharacterDataRecovery.getCharacterBackups('char2');

      expect(char1Backups).toHaveLength(2);
      expect(char2Backups).toHaveLength(1);
    });

    it('should restore data from backup', () => {
      const backup = CharacterDataRecovery.createBackup(mockCharacterData, 'manual', 'char123');
      const restoredData = CharacterDataRecovery.restoreFromBackup(backup.id);

      expect(restoredData).toEqual(mockCharacterData);
    });

    it('should throw error when restoring non-existent backup', () => {
      expect(() => {
        CharacterDataRecovery.restoreFromBackup('non-existent-id');
      }).toThrow('Backup with ID "non-existent-id" not found');
    });

    it('should delete specific backup', () => {
      const backup1 = CharacterDataRecovery.createBackup(mockCharacterData, 'manual');
      const backup2 = CharacterDataRecovery.createBackup(mockCharacterData, 'auto-save');

      CharacterDataRecovery.deleteBackup(backup1.id);

      const remainingBackups = CharacterDataRecovery.getAllBackups();
      expect(remainingBackups).toHaveLength(1);
      expect(remainingBackups[0].id).toBe(backup2.id);
    });

    it('should clear all backups', () => {
      CharacterDataRecovery.createBackup(mockCharacterData, 'manual');
      CharacterDataRecovery.createBackup(mockCharacterData, 'auto-save');

      CharacterDataRecovery.clearAllBackups();

      const backups = CharacterDataRecovery.getAllBackups();
      expect(backups).toHaveLength(0);
    });

    it('should clean up old backups when limit exceeded', () => {
      jest.useFakeTimers();

      // Create more than the maximum number of backups
      for (let i = 0; i < 15; i++) {
        CharacterDataRecovery.createBackup(mockCharacterData, 'auto-save');
        // Add small delay to ensure different timestamps
        jest.advanceTimersByTime(1);
      }

      const backups = CharacterDataRecovery.getAllBackups();
      expect(backups.length).toBeLessThanOrEqual(10);

      jest.useRealTimers();
    });
  });

  describe('Auto-save Functionality', () => {
    it('should save auto-save data to localStorage', () => {
      CharacterDataRecovery.autoSaveCharacterData(mockCharacterData, 'char123');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dnd_character_autosave',
        expect.any(String)
      );
    });

    it('should retrieve auto-saved data', () => {
      CharacterDataRecovery.autoSaveCharacterData(mockCharacterData, 'char123');
      const autoSaved = CharacterDataRecovery.getAutoSavedData();

      expect(autoSaved).not.toBeNull();
      expect(autoSaved!.data).toEqual(mockCharacterData);
      expect(autoSaved!.characterId).toBe('char123');
      expect(autoSaved!.timestamp).toBeInstanceOf(Date);
    });

    it('should return null when no auto-save data exists', () => {
      const autoSaved = CharacterDataRecovery.getAutoSavedData();
      expect(autoSaved).toBeNull();
    });

    it('should clear auto-saved data', () => {
      CharacterDataRecovery.autoSaveCharacterData(mockCharacterData, 'char123');
      CharacterDataRecovery.clearAutoSavedData();

      const autoSaved = CharacterDataRecovery.getAutoSavedData();
      expect(autoSaved).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw, but log a warning
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        CharacterDataRecovery.autoSaveCharacterData(mockCharacterData);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to auto-save character data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Validation with Recovery', () => {
    it('should validate valid character data', () => {
      const result = CharacterDataRecovery.validateWithRecovery(mockCharacterData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.suggestedFixes).toEqual({});
    });

    it('should provide suggested fixes for invalid data', () => {
      const invalidData = {
        ...mockCharacterData,
        name: '', // Invalid: empty name
        abilityScores: {
          strength: 0, // Invalid: too low
          dexterity: 31, // Invalid: too high
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
      };

      const result = CharacterDataRecovery.validateWithRecovery(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.suggestedFixes).toBeDefined();
      expect(result.autoFixableData).toBeDefined();
    });

    it('should generate auto-fixable data for correctable errors', () => {
      const invalidData = {
        ...mockCharacterData,
        abilityScores: {
          strength: 0, // Auto-fixable to 8
          dexterity: 31, // Auto-fixable to 20
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
      };

      const result = CharacterDataRecovery.validateWithRecovery(invalidData);

      expect(result.autoFixableData).toBeDefined();
      expect(result.autoFixableData!.abilityScores!.strength).toBe(8);
      expect(result.autoFixableData!.abilityScores!.dexterity).toBe(20);
    });

    it('should generate recovery suggestions', () => {
      const incompleteData = {
        name: 'Test Character',
        // Missing required fields
      };

      const suggestions = CharacterDataRecovery.generateRecoverySuggestions(incompleteData);

      expect(suggestions).toContain('Select a character race to define racial traits');
      expect(suggestions).toContain('Choose at least one character class to define abilities');
      expect(suggestions).toContain('Set ability scores using point buy, standard array, or rolled stats');
    });

    it('should suggest fixes for low ability scores', () => {
      const lowStatsData = {
        ...mockCharacterData,
        abilityScores: {
          strength: 1,
          dexterity: 1,
          constitution: 1,
          intelligence: 1,
          wisdom: 1,
          charisma: 1,
        },
      };

      const suggestions = CharacterDataRecovery.generateRecoverySuggestions(lowStatsData);

      expect(suggestions).toContain(
        'Ability scores should be at least 1 (consider 8 as practical minimum)'
      );
    });

    it('should suggest improvements for very low ability scores', () => {
      const veryLowStatsData = {
        ...mockCharacterData,
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
      };

      const suggestions = CharacterDataRecovery.generateRecoverySuggestions(veryLowStatsData);

      expect(suggestions).toContain(
        'Consider having at least one ability score above 10 for character effectiveness'
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const backups = CharacterDataRecovery.getAllBackups();

      expect(backups).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to retrieve backups:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should validate backup data correctly', () => {
      const validBackup = CharacterDataRecovery.createBackup(mockCharacterData);
      expect(validBackup.isValid).toBe(true);

      const invalidBackup = CharacterDataRecovery.createBackup({});
      expect(invalidBackup.isValid).toBe(false);
    });

    it('should handle missing required fields in recovery suggestions', () => {
      const emptyData = {};
      const suggestions = CharacterDataRecovery.generateRecoverySuggestions(emptyData);

      expect(suggestions).toContain('Add a character name to identify your character');
      expect(suggestions).toContain('Select a character race to define racial traits');
      expect(suggestions).toContain('Choose at least one character class to define abilities');
    });

    it('should create deep clones to avoid reference issues', () => {
      const originalData = { ...mockCharacterData };
      const backup = CharacterDataRecovery.createBackup(originalData);

      // Modify original data
      originalData.name = 'Modified Name';

      // Backup should remain unchanged
      expect(backup.data.name).toBe('Test Character');
    });

    it('should handle localStorage quota errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        CharacterDataRecovery.createBackup(mockCharacterData);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

describe('useCharacterAutoSave Hook', () => {
  const mockCharacterData: Partial<CharacterCreation> = {
    name: 'Test Character',
    type: 'pc',
    race: 'human',
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
  };

  beforeEach(() => {
    jest.useFakeTimers();
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should set up auto-save interval when enabled', () => {
    const cleanup = useCharacterAutoSave(mockCharacterData, 'char123', {
      enableAutoSave: true,
      autoSaveInterval: 5000,
    });

    expect(cleanup).toBeInstanceOf(Function);

    // Fast-forward time and check if auto-save was called
    jest.advanceTimersByTime(5000);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dnd_character_autosave',
      expect.any(String)
    );
  });

  it('should not set up auto-save when disabled', () => {
    const cleanup = useCharacterAutoSave(mockCharacterData, 'char123', {
      enableAutoSave: false,
    });

    jest.advanceTimersByTime(30000);

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('should return no-op cleanup for SSR environments', () => {
    // Mock SSR environment
    const originalWindow = global.window;
    delete (global as any).window;

    const cleanup = useCharacterAutoSave(mockCharacterData, 'char123');

    expect(cleanup).toBeInstanceOf(Function);

    // Restore window
    global.window = originalWindow;
  });

  it('should clean up interval when cleanup function is called', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const cleanup = useCharacterAutoSave(mockCharacterData, 'char123', {
      enableAutoSave: true,
    });

    cleanup();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should not auto-save empty character data', () => {
    const emptyData = {};

    useCharacterAutoSave(emptyData, 'char123', {
      enableAutoSave: true,
      autoSaveInterval: 1000,
    });

    jest.advanceTimersByTime(1000);

    // Should not call setItem for auto-save because data is empty
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
      'dnd_character_autosave',
      expect.any(String)
    );
  });
});