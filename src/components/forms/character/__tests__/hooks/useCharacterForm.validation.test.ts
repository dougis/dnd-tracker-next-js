import { renderHook, act } from '@testing-library/react';
import { useCharacterForm } from '../../hooks/useCharacterForm';

describe('useCharacterForm - Validation and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('validates complete valid form', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Set up valid form data
      act(() => {
        result.current.updateBasicInfo({
          name: 'Test Character',
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      act(() => {
        result.current.updateAbilityScores({
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 11,
          charisma: 10,
        });
      });

      act(() => {
        result.current.updateClasses([
          { className: 'fighter', level: 1 },
        ]);
      });

      act(() => {
        result.current.updateCombatStats({
          hitPoints: {
            maximum: 10,
            current: 10,
          },
          armorClass: 16,
          speed: 30,
          proficiencyBonus: 2,
        });
      });

      expect(result.current.isFormValid).toBe(true);
    });

    it('validates custom race requirement', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Set custom race without custom race name
      act(() => {
        result.current.updateBasicInfo({
          name: 'Test Character',
          type: 'pc',
          race: 'custom',
          customRace: '', // Missing required custom race name
        });
      });

      expect(result.current.isFormValid).toBe(false);

      // Now provide custom race name
      act(() => {
        result.current.updateBasicInfo({
          name: 'Test Character',
          type: 'pc',
          race: 'custom',
          customRace: 'Half-Dragon',
        });
      });

      // Still invalid due to other missing requirements, but custom race check passes
      const isCustomRaceValid = result.current.formData.basicInfo.race !== 'custom' ||
                               result.current.formData.basicInfo.customRace.trim() !== '';
      expect(isCustomRaceValid).toBe(true);
    });

    it('runs Zod validation and sets errors', () => {
      const { result } = renderHook(() => useCharacterForm());

      let validationResult: boolean = false;

      act(() => {
        validationResult = result.current.validateForm();
      });

      expect(validationResult).toBe(false);
      // Should have errors for missing name
      expect(Object.keys(result.current.errors.basicInfo).length).toBeGreaterThan(0);
    });

    it('clears errors when updating form sections', () => {
      const { result } = renderHook(() => useCharacterForm());

      // First create errors by validating invalid form
      act(() => {
        result.current.validateForm();
      });

      // Verify we have errors initially
      const hasInitialErrors = Object.values(result.current.errors).some(errorSection =>
        Object.keys(errorSection).length > 0
      );
      expect(hasInitialErrors).toBe(true);

      // Update basic info should clear basic info errors
      act(() => {
        result.current.updateBasicInfo({
          name: 'Test Character',
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      expect(result.current.errors.basicInfo).toEqual({});

      // Update ability scores should clear ability score errors
      act(() => {
        result.current.updateAbilityScores({
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 11,
          charisma: 10,
        });
      });

      expect(result.current.errors.abilityScores).toEqual({});
    });
  });

  describe('Form Reset', () => {
    it('resets form to initial state', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Change some values
      act(() => {
        result.current.updateBasicInfo({
          name: 'Test Character',
          type: 'npc',
          race: 'elf',
          customRace: '',
        });
      });

      act(() => {
        result.current.updateAbilityScores({
          strength: 20,
          dexterity: 18,
          constitution: 16,
          intelligence: 14,
          wisdom: 12,
          charisma: 10,
        });
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      // Should be back to initial state
      expect(result.current.formData.basicInfo.name).toBe('');
      expect(result.current.formData.basicInfo.type).toBe('pc');
      expect(result.current.formData.basicInfo.race).toBe('human');
      expect(result.current.formData.abilityScores.strength).toBe(10);
      expect(result.current.errors).toEqual({
        basicInfo: {},
        abilityScores: {},
        classes: {},
        combatStats: {},
      });
    });
  });

  describe('Form Validation Logic', () => {
    it('categorizes errors correctly', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Create an invalid form to test error categorization
      act(() => {
        result.current.updateBasicInfo({
          name: '', // Invalid - required
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      act(() => {
        result.current.updateAbilityScores({
          strength: 0, // Invalid - out of range
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        });
      });

      act(() => {
        result.current.validateForm();
      });

      // Should have errors in appropriate categories
      expect(Object.keys(result.current.errors.basicInfo).length).toBeGreaterThan(0);
    });

    it('validates form with multiclass characters', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Set up valid multiclass character
      act(() => {
        result.current.updateBasicInfo({
          name: 'Multiclass Character',
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      act(() => {
        result.current.updateClasses([
          { className: 'fighter', level: 3 },
          { className: 'rogue', level: 2 },
        ]);
      });

      act(() => {
        result.current.updateCombatStats({
          hitPoints: {
            maximum: 35,
            current: 35,
          },
          armorClass: 16,
          speed: 30,
          proficiencyBonus: 3,
        });
      });

      expect(result.current.isFormValid).toBe(true);
    });

    it('validates maximum class levels', () => {
      const { result } = renderHook(() => useCharacterForm());

      act(() => {
        result.current.updateClasses([
          { className: 'fighter', level: 21 }, // Invalid: exceeds max level
        ]);
      });

      expect(result.current.isFormValid).toBe(false);
    });

    it('handles validation errors from Zod schema', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Create form data that will fail Zod validation
      act(() => {
        result.current.updateBasicInfo({
          name: 'a'.repeat(200), // Too long
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      let validationResult: boolean = false;
      act(() => {
        validationResult = result.current.validateForm();
      });

      expect(validationResult).toBe(false);
      expect(Object.keys(result.current.errors.basicInfo).length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing temporary hit points', () => {
      const { result } = renderHook(() => useCharacterForm());

      act(() => {
        result.current.updateCombatStats({
          hitPoints: {
            maximum: 10,
            current: 10,
            // temporary is undefined
          },
          armorClass: 16,
        });
      });

      // Should still work for validation transform
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.formData.combatStats.hitPoints.temporary).toBeUndefined();
    });

    it('handles missing optional speed and proficiency bonus', () => {
      const { result } = renderHook(() => useCharacterForm());

      act(() => {
        result.current.updateCombatStats({
          hitPoints: {
            maximum: 10,
            current: 10,
          },
          armorClass: 16,
          // speed and proficiencyBonus are undefined
        });
      });

      // Validation should apply defaults
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.formData.combatStats.speed).toBeUndefined();
      expect(result.current.formData.combatStats.proficiencyBonus).toBeUndefined();
    });

    it('validates empty character name', () => {
      const { result } = renderHook(() => useCharacterForm());

      act(() => {
        result.current.updateBasicInfo({
          name: '   ', // Just whitespace
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      expect(result.current.isFormValid).toBe(false);
    });
  });
});