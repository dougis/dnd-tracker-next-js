import { renderHook, act } from '@testing-library/react';
import { useCharacterForm } from '../../hooks/useCharacterForm';

describe('useCharacterForm - Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial form data and state', () => {
      const { result } = renderHook(() => useCharacterForm());

      expect(result.current.formData).toEqual({
        basicInfo: {
          name: '',
          type: 'pc',
          race: 'human',
          customRace: '',
        },
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        classes: [
          { className: 'fighter', level: 1 },
        ],
        combatStats: {
          hitPoints: {
            maximum: 10,
            current: 10,
            temporary: 0,
          },
          armorClass: 10,
          speed: 30,
          proficiencyBonus: 2,
        },
      });

      expect(result.current.errors).toEqual({
        basicInfo: {},
        abilityScores: {},
        classes: {},
        combatStats: {},
      });

      expect(result.current.isFormValid).toBe(false); // Missing required name
    });

    it('provides all expected hook methods', () => {
      const { result } = renderHook(() => useCharacterForm());

      expect(typeof result.current.updateBasicInfo).toBe('function');
      expect(typeof result.current.updateAbilityScores).toBe('function');
      expect(typeof result.current.updateClasses).toBe('function');
      expect(typeof result.current.updateCombatStats).toBe('function');
      expect(typeof result.current.validateForm).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
    });
  });

  describe('Basic Info Updates', () => {
    it('updates basic info and clears related errors', () => {
      const { result } = renderHook(() => useCharacterForm());

      // First set some errors
      act(() => {
        result.current.validateForm();
      });

      const newBasicInfo = {
        name: 'Test Character',
        type: 'npc' as const,
        race: 'elf' as const,
        customRace: '',
      };

      act(() => {
        result.current.updateBasicInfo(newBasicInfo);
      });

      expect(result.current.formData.basicInfo).toEqual(newBasicInfo);
      expect(result.current.errors.basicInfo).toEqual({});
    });

    it('handles custom race correctly', () => {
      const { result } = renderHook(() => useCharacterForm());

      const customRaceInfo = {
        name: 'Test Character',
        type: 'pc' as const,
        race: 'custom' as const,
        customRace: 'Half-Dragon',
      };

      act(() => {
        result.current.updateBasicInfo(customRaceInfo);
      });

      expect(result.current.formData.basicInfo).toEqual(customRaceInfo);
    });
  });

  describe('Ability Scores Updates', () => {
    it('updates ability scores and clears related errors', () => {
      const { result } = renderHook(() => useCharacterForm());

      const newAbilityScores = {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 11,
        charisma: 10,
      };

      act(() => {
        result.current.updateAbilityScores(newAbilityScores);
      });

      expect(result.current.formData.abilityScores).toEqual(newAbilityScores);
      expect(result.current.errors.abilityScores).toEqual({});
    });

    it('validates ability score ranges', () => {
      const { result } = renderHook(() => useCharacterForm());

      const invalidAbilityScores = {
        strength: 0, // Invalid: too low
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 11,
        charisma: 10,
      };

      act(() => {
        result.current.updateAbilityScores(invalidAbilityScores);
      });

      expect(result.current.isFormValid).toBe(false);
    });

    it('accepts maximum ability scores', () => {
      const { result } = renderHook(() => useCharacterForm());

      const maxAbilityScores = {
        strength: 30,
        dexterity: 30,
        constitution: 30,
        intelligence: 30,
        wisdom: 30,
        charisma: 30,
      };

      act(() => {
        result.current.updateAbilityScores(maxAbilityScores);
      });

      expect(result.current.formData.abilityScores).toEqual(maxAbilityScores);
    });
  });
});