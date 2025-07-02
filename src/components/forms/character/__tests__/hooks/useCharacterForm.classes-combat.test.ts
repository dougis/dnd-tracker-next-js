import { renderHook, act } from '@testing-library/react';
import { useCharacterForm } from '../../hooks/useCharacterForm';

describe('useCharacterForm - Classes and Combat Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Classes Updates', () => {
    it('updates classes and clears related errors', () => {
      const { result } = renderHook(() => useCharacterForm());

      const newClasses = [
        { className: 'wizard' as const, level: 3 },
        { className: 'rogue' as const, level: 2 },
      ];

      act(() => {
        result.current.updateClasses(newClasses);
      });

      expect(result.current.formData.classes).toEqual(newClasses);
      expect(result.current.errors.classes).toEqual({});
    });

    it('handles single class correctly', () => {
      const { result } = renderHook(() => useCharacterForm());

      const singleClass = [
        { className: 'paladin' as const, level: 5 },
      ];

      act(() => {
        result.current.updateClasses(singleClass);
      });

      expect(result.current.formData.classes).toEqual(singleClass);
    });

    it('validates class levels', () => {
      const { result } = renderHook(() => useCharacterForm());

      const invalidClasses = [
        { className: 'fighter' as const, level: 0 }, // Invalid: too low
      ];

      act(() => {
        result.current.updateClasses(invalidClasses);
      });

      expect(result.current.isFormValid).toBe(false);
    });

    it('rejects empty classes array in validation', () => {
      const { result } = renderHook(() => useCharacterForm());

      // Add valid basic info first
      act(() => {
        result.current.updateBasicInfo({
          name: 'Test Character',
          type: 'pc',
          race: 'human',
          customRace: '',
        });
      });

      act(() => {
        result.current.updateClasses([]);
      });

      expect(result.current.isFormValid).toBe(false);
    });
  });

  describe('Combat Stats Updates', () => {
    it('updates combat stats and clears related errors', () => {
      const { result } = renderHook(() => useCharacterForm());

      const newCombatStats = {
        hitPoints: {
          maximum: 25,
          current: 20,
          temporary: 5,
        },
        armorClass: 16,
        speed: 25,
        proficiencyBonus: 3,
      };

      act(() => {
        result.current.updateCombatStats(newCombatStats);
      });

      expect(result.current.formData.combatStats).toEqual(newCombatStats);
      expect(result.current.errors.combatStats).toEqual({});
    });

    it('handles optional combat stats correctly', () => {
      const { result } = renderHook(() => useCharacterForm());

      const combatStatsWithOptionals = {
        hitPoints: {
          maximum: 25,
          current: 20,
        },
        armorClass: 16,
      };

      act(() => {
        result.current.updateCombatStats(combatStatsWithOptionals);
      });

      expect(result.current.formData.combatStats.hitPoints.maximum).toBe(25);
      expect(result.current.formData.combatStats.armorClass).toBe(16);
    });

    it('validates hit points maximum', () => {
      const { result } = renderHook(() => useCharacterForm());

      const invalidCombatStats = {
        hitPoints: {
          maximum: 0, // Invalid: must be > 0
          current: 0,
        },
        armorClass: 16,
      };

      act(() => {
        result.current.updateCombatStats(invalidCombatStats);
      });

      expect(result.current.isFormValid).toBe(false);
    });

    it('validates armor class', () => {
      const { result } = renderHook(() => useCharacterForm());

      const invalidCombatStats = {
        hitPoints: {
          maximum: 10,
          current: 10,
        },
        armorClass: 0, // Invalid: must be > 0
      };

      act(() => {
        result.current.updateCombatStats(invalidCombatStats);
      });

      expect(result.current.isFormValid).toBe(false);
    });
  });
});