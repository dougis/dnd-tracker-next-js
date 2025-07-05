import {
  saveCombatState,
  loadCombatState,
  clearCombatState,
} from '../combatStateManager';
import { IEncounter } from '../interfaces';
import { createMockEncounter, testWithoutWindow } from './combatStateManager.test-utils';

describe('Combat State Manager - Persistence', () => {
  let encounter: IEncounter;

  beforeEach(() => {
    encounter = createMockEncounter();
    clearCombatState(encounter._id.toString());
  });

  describe('saveCombatState', () => {
    it('should save combat state to storage', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 3;
      encounter.combatState.currentTurn = 1;
      encounter.combatState.initiativeOrder = [
        {
          participantId: encounter._id,
          initiative: 15,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        },
      ];

      const result = saveCombatState(encounter);
      expect(result).toBe(true);
    });

    it('should handle save errors gracefully', () => {
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn(() => {
        throw new Error('Serialization failed');
      });

      const result = saveCombatState(encounter);
      expect(result).toBe(false);

      JSON.stringify = originalStringify;
    });
  });

  describe('loadCombatState', () => {
    it('should load previously saved combat state', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 5;
      encounter.combatState.currentTurn = 2;
      saveCombatState(encounter);

      encounter.combatState.isActive = false;
      encounter.combatState.currentRound = 1;
      encounter.combatState.currentTurn = 0;

      const result = loadCombatState(encounter);

      expect(result).toBe(true);
      expect(encounter.combatState.isActive).toBe(true);
      expect(encounter.combatState.currentRound).toBe(5);
      expect(encounter.combatState.currentTurn).toBe(2);
    });

    it('should return false if no saved state exists', () => {
      const newEncounter = createMockEncounter();
      clearCombatState(newEncounter._id.toString());

      const result = loadCombatState(newEncounter);

      expect(result).toBe(false);
    });

    it('should validate loaded state integrity', () => {
      const originalWindow = global.window;
      global.window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(JSON.stringify({ isActive: 'invalid' })),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        }
      } as any;

      const result = loadCombatState(encounter);
      expect(result).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('Storage Integration', () => {
    it('should handle localStorage parse errors gracefully', () => {
      const originalWindow = global.window;
      global.window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue('invalid json{'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        }
      } as any;

      const result = loadCombatState(encounter);
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it('should cover localStorage access paths in loadCombatState', () => {
      clearCombatState(encounter._id.toString());
      
      const originalWindow = global.window;
      global.window = {
        localStorage: {
          getItem: jest.fn().mockReturnValue(null),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        }
      } as any;

      const result = loadCombatState(encounter);
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    it('should cover localStorage paths in saveCombatState', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 2;

      const originalWindow = global.window;
      const mockSetItem = jest.fn();
      global.window = {
        localStorage: {
          getItem: jest.fn(),
          setItem: mockSetItem,
          removeItem: jest.fn(),
        }
      } as any;

      const result = saveCombatState(encounter);
      expect(result).toBe(true);

      global.window = originalWindow;
    });

    it('should cover localStorage paths in clearCombatState', () => {
      const originalWindow = global.window;
      const mockRemoveItem = jest.fn();
      global.window = {
        localStorage: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: mockRemoveItem,
        }
      } as any;

      clearCombatState(encounter._id.toString());

      global.window = originalWindow;
    });

    it('should handle window undefined when loading state', () => {
      testWithoutWindow(() => {
        const result = loadCombatState(encounter);
        expect(result).toBe(false);
      });
    });

    it('should handle window undefined when saving state', () => {
      testWithoutWindow(() => {
        encounter.combatState.isActive = true;
        const result = saveCombatState(encounter);
        expect(result).toBe(true);
      });
    });

    it('should handle window undefined when clearing state', () => {
      testWithoutWindow(() => {
        expect(() => clearCombatState(encounter._id.toString())).not.toThrow();
      });
    });
  });
});