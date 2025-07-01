/**
 * Character Service CRUD Operations Tests
 * 
 * Focused tests for basic CRUD operations following TDD principles.
 */

import { Types } from 'mongoose';

// Mock the Character model before any imports
jest.mock('../../models/Character', () => ({
  Character: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}));

import { CharacterService } from '../CharacterService';
import { CHARACTER_ERROR_CODES } from '../CharacterServiceErrors';
import {
  createMockCharacterCreation,
  createMockCharacterUpdate,
  createValidObjectId,
  createInvalidObjectId,
  expectSuccess,
  expectError,
} from './CharacterService.test-helpers';

describe('CharacterService - CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Operations', () => {
    it('should create character with minimum required fields', async () => {
      const ownerId = createValidObjectId();
      const minimalCharacter = {
        name: 'Minimal Character',
        type: 'pc' as const,
        race: 'human',
        classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
        abilityScores: {
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10,
        },
        hitPoints: { maximum: 10, current: 10, temporary: 0 },
        armorClass: 10,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false, dexterity: false, constitution: false,
          intelligence: false, wisdom: false, charisma: false,
        },
      };
      
      const result = await CharacterService.createCharacter(ownerId, minimalCharacter);
      
      const character = expectSuccess(result);
      expect(character.name).toBe(minimalCharacter.name);
      expect(character._id).toBeDefined();
      expect(character.createdAt).toBeDefined();
    });

    it('should set default values for optional fields', async () => {
      const ownerId = createValidObjectId();
      const characterData = createMockCharacterCreation();
      delete characterData.speed;
      delete characterData.skills;
      delete characterData.equipment;
      
      const result = await CharacterService.createCharacter(ownerId, characterData);
      
      const character = expectSuccess(result);
      expect(character.speed).toBe(30); // Default speed
      expect(character.skills).toEqual({}); // Default empty skills
      expect(character.equipment).toEqual([]); // Default empty equipment
    });

    it('should validate character name constraints', async () => {
      const ownerId = createValidObjectId();
      const longNameCharacter = {
        ...createMockCharacterCreation(),
        name: 'A'.repeat(101), // Exceeds 100 character limit
      };
      
      const result = await CharacterService.createCharacter(ownerId, longNameCharacter);
      
      expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should validate ability score constraints', async () => {
      const ownerId = createValidObjectId();
      const invalidAbilityCharacter = {
        ...createMockCharacterCreation(),
        abilityScores: {
          strength: 0, // Below minimum
          dexterity: 14,
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 31, // Above maximum
        },
      };
      
      const result = await CharacterService.createCharacter(ownerId, invalidAbilityCharacter);
      
      expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should validate hit points constraints', async () => {
      const ownerId = createValidObjectId();
      const invalidHPCharacter = {
        ...createMockCharacterCreation(),
        hitPoints: {
          maximum: -5, // Invalid negative
          current: 15, // Greater than maximum
          temporary: -2, // Invalid negative
        },
      };
      
      const result = await CharacterService.createCharacter(ownerId, invalidHPCharacter);
      
      expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });
  });

  describe('Read Operations', () => {
    it('should retrieve character with all fields', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      
      const result = await CharacterService.getCharacterById(characterId, userId);
      
      const character = expectSuccess(result);
      expect(character._id).toBeDefined();
      expect(character.name).toBeDefined();
      expect(character.abilityScores).toBeDefined();
      expect(character.classes).toBeInstanceOf(Array);
      expect(character.equipment).toBeInstanceOf(Array);
      expect(character.spells).toBeInstanceOf(Array);
    });

    it('should populate computed fields', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      
      const result = await CharacterService.getCharacterById(characterId, userId);
      
      const character = expectSuccess(result);
      expect(character.level).toBeGreaterThan(0);
      expect(typeof character.getAbilityModifier).toBe('function');
      expect(typeof character.getInitiativeModifier).toBe('function');
    });

    it('should handle non-existent character gracefully', async () => {
      const nonExistentId = new Types.ObjectId().toString();
      const userId = createValidObjectId();
      
      const result = await CharacterService.getCharacterById(nonExistentId, userId);
      
      expectError(result, CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
    });
  });

  describe('Update Operations', () => {
    it('should update basic character information', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      const updates = {
        name: 'Updated Name',
        backstory: 'Updated backstory text',
        notes: 'Updated notes',
      };
      
      const result = await CharacterService.updateCharacter(characterId, userId, updates);
      
      const character = expectSuccess(result);
      expect(character.name).toBe(updates.name);
      expect(character.backstory).toBe(updates.backstory);
      expect(character.notes).toBe(updates.notes);
      expect(character.updatedAt).toBeDefined();
    });

    it('should update hit points correctly', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      const updates = {
        hitPoints: {
          maximum: 25,
          current: 20,
          temporary: 5,
        },
      };
      
      const result = await CharacterService.updateCharacter(characterId, userId, updates);
      
      const character = expectSuccess(result);
      expect(character.hitPoints.maximum).toBe(25);
      expect(character.hitPoints.current).toBe(20);
      expect(character.hitPoints.temporary).toBe(5);
    });

    it('should update ability scores', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      const updates = {
        abilityScores: {
          strength: 18,
          dexterity: 16,
          constitution: 17,
          intelligence: 12,
          wisdom: 14,
          charisma: 10,
        },
      };
      
      const result = await CharacterService.updateCharacter(characterId, userId, updates);
      
      const character = expectSuccess(result);
      expect(character.abilityScores.strength).toBe(18);
      expect(character.abilityScores.dexterity).toBe(16);
    });

    it('should handle partial updates', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      const partialUpdate = {
        armorClass: 18,
      };
      
      const result = await CharacterService.updateCharacter(characterId, userId, partialUpdate);
      
      const character = expectSuccess(result);
      expect(character.armorClass).toBe(18);
      // Other fields should remain unchanged
    });

    it('should validate update data constraints', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      const invalidUpdate = {
        abilityScores: {
          strength: 35, // Above maximum
        },
      };
      
      const result = await CharacterService.updateCharacter(characterId, userId, invalidUpdate as any);
      
      expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should prevent unauthorized updates', async () => {
      const characterId = createValidObjectId();
      const wrongUserId = createValidObjectId();
      const updates = { name: 'Hacked Name' };
      
      const result = await CharacterService.updateCharacter(characterId, wrongUserId, updates);
      
      expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
    });
  });

  describe('Delete Operations', () => {
    it('should delete character successfully', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      
      const result = await CharacterService.deleteCharacter(characterId, userId);
      
      expectSuccess(result);
    });

    it('should prevent unauthorized deletion', async () => {
      const characterId = createValidObjectId();
      const wrongUserId = createValidObjectId();
      
      const result = await CharacterService.deleteCharacter(characterId, wrongUserId);
      
      expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
    });

    it('should prevent deletion of character in active encounter', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      // Mock character being in active encounter
      
      const result = await CharacterService.deleteCharacter(characterId, userId);
      
      expectError(result, CHARACTER_ERROR_CODES.CHARACTER_IN_USE);
    });

    it('should handle deletion of non-existent character', async () => {
      const nonExistentId = new Types.ObjectId().toString();
      const userId = createValidObjectId();
      
      const result = await CharacterService.deleteCharacter(nonExistentId, userId);
      
      expectError(result, CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
    });

    it('should cascade delete related data', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      
      const result = await CharacterService.deleteCharacter(characterId, userId);
      
      expectSuccess(result);
      // Should also remove character from parties, encounters, etc.
    });
  });

  describe('Bulk Operations', () => {
    it('should create multiple characters efficiently', async () => {
      const ownerId = createValidObjectId();
      const characters = [
        createMockCharacterCreation({ name: 'Character 1' }),
        createMockCharacterCreation({ name: 'Character 2' }),
        createMockCharacterCreation({ name: 'Character 3' }),
      ];
      
      const result = await CharacterService.createMultipleCharacters(ownerId, characters);
      
      const createdCharacters = expectSuccess(result);
      expect(createdCharacters).toHaveLength(3);
      expect(createdCharacters.map(c => c.name)).toEqual(['Character 1', 'Character 2', 'Character 3']);
    });

    it('should update multiple characters', async () => {
      const userId = createValidObjectId();
      const updates = [
        { characterId: createValidObjectId(), data: { armorClass: 16 } },
        { characterId: createValidObjectId(), data: { armorClass: 17 } },
      ];
      
      const result = await CharacterService.updateMultipleCharacters(userId, updates);
      
      const updatedCharacters = expectSuccess(result);
      expect(updatedCharacters).toHaveLength(2);
    });

    it('should delete multiple characters', async () => {
      const userId = createValidObjectId();
      const characterIds = [createValidObjectId(), createValidObjectId()];
      
      const result = await CharacterService.deleteMultipleCharacters(userId, characterIds);
      
      expectSuccess(result);
    });

    it('should handle partial failures in bulk operations', async () => {
      const ownerId = createValidObjectId();
      const characters = [
        createMockCharacterCreation({ name: 'Valid Character' }),
        { name: '', type: 'invalid' } as any, // Invalid character
      ];
      
      const result = await CharacterService.createMultipleCharacters(ownerId, characters);
      
      const response = expectSuccess(result);
      expect(response.successful).toHaveLength(1);
      expect(response.failed).toHaveLength(1);
    });
  });
});