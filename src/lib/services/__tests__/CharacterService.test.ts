/**
 * Character Service Tests
 * 
 * Comprehensive test suite for CharacterService following TDD principles.
 * All tests should initially fail until implementation is complete.
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
  createMockCharacter,
  createMockCharacterSummary,
  createMockCharacterPreset,
  createValidObjectId,
  createInvalidObjectId,
  expectSuccess,
  expectError,
  multiclassCharacterData,
  npcCharacterData,
  invalidCharacterData,
} from './CharacterService.test-helpers';

describe('CharacterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    describe('createCharacter', () => {
      it('should create a new character successfully', async () => {
        const ownerId = createValidObjectId();
        const characterData = createMockCharacterCreation();
        
        const result = await CharacterService.createCharacter(ownerId, characterData);
        
        const character = expectSuccess(result);
        expect(character.name).toBe(characterData.name);
        expect(character.ownerId.toString()).toBe(ownerId);
        expect(character.type).toBe(characterData.type);
      });

      it('should fail with invalid owner ID', async () => {
        const invalidOwnerId = createInvalidObjectId();
        const characterData = createMockCharacterCreation();
        
        const result = await CharacterService.createCharacter(invalidOwnerId, characterData);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
      });

      it('should fail with invalid character data', async () => {
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.createCharacter(ownerId, invalidCharacterData as any);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
      });

      it('should create multiclass character correctly', async () => {
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.createCharacter(ownerId, multiclassCharacterData);
        
        const character = expectSuccess(result);
        expect(character.classes).toHaveLength(2);
        expect(character.level).toBe(5); // 3 + 2
      });

      it('should create NPC character correctly', async () => {
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.createCharacter(ownerId, npcCharacterData);
        
        const character = expectSuccess(result);
        expect(character.type).toBe('npc');
        expect(character.race).toBe('orc');
      });

      it('should enforce character limit for subscription tier', async () => {
        const ownerId = createValidObjectId();
        const characterData = createMockCharacterCreation();
        
        // Mock having reached character limit
        const result = await CharacterService.createCharacter(ownerId, characterData);
        
        expectError(result, CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
      });
    });

    describe('getCharacterById', () => {
      it('should retrieve character by ID successfully', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharacterById(characterId, userId);
        
        const character = expectSuccess(result);
        expect(character._id.toString()).toBe(characterId);
      });

      it('should fail with invalid character ID', async () => {
        const invalidId = createInvalidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharacterById(invalidId, userId);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
      });

      it('should fail when character not found', async () => {
        const nonExistentId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharacterById(nonExistentId, userId);
        
        expectError(result, CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
      });

      it('should fail for unauthorized access', async () => {
        const characterId = createValidObjectId();
        const unauthorizedUserId = createValidObjectId();
        
        const result = await CharacterService.getCharacterById(characterId, unauthorizedUserId);
        
        expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });

      it('should allow access to public characters', async () => {
        const characterId = createValidObjectId();
        const anyUserId = createValidObjectId();
        
        const result = await CharacterService.getCharacterById(characterId, anyUserId);
        
        const character = expectSuccess(result);
        expect(character.isPublic).toBe(true);
      });
    });

    describe('updateCharacter', () => {
      it('should update character successfully', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        const updateData = createMockCharacterUpdate();
        
        const result = await CharacterService.updateCharacter(characterId, userId, updateData);
        
        const character = expectSuccess(result);
        expect(character.name).toBe(updateData.name);
      });

      it('should fail with invalid character ID', async () => {
        const invalidId = createInvalidObjectId();
        const userId = createValidObjectId();
        const updateData = createMockCharacterUpdate();
        
        const result = await CharacterService.updateCharacter(invalidId, userId, updateData);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
      });

      it('should fail for unauthorized update', async () => {
        const characterId = createValidObjectId();
        const unauthorizedUserId = createValidObjectId();
        const updateData = createMockCharacterUpdate();
        
        const result = await CharacterService.updateCharacter(characterId, unauthorizedUserId, updateData);
        
        expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });

      it('should validate update data', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        const invalidUpdate = { hitPoints: { maximum: -5 } }; // Invalid negative HP
        
        const result = await CharacterService.updateCharacter(characterId, userId, invalidUpdate as any);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
      });
    });

    describe('deleteCharacter', () => {
      it('should delete character successfully', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.deleteCharacter(characterId, userId);
        
        expectSuccess(result);
      });

      it('should fail with invalid character ID', async () => {
        const invalidId = createInvalidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.deleteCharacter(invalidId, userId);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
      });

      it('should fail for unauthorized deletion', async () => {
        const characterId = createValidObjectId();
        const unauthorizedUserId = createValidObjectId();
        
        const result = await CharacterService.deleteCharacter(characterId, unauthorizedUserId);
        
        expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });

      it('should fail when character is in use', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.deleteCharacter(characterId, userId);
        
        expectError(result, CHARACTER_ERROR_CODES.CHARACTER_IN_USE);
      });
    });
  });

  describe('Search and Filtering', () => {
    describe('getCharactersByOwner', () => {
      it('should retrieve characters for owner with pagination', async () => {
        const ownerId = createValidObjectId();
        const page = 1;
        const limit = 10;
        
        const result = await CharacterService.getCharactersByOwner(ownerId, page, limit);
        
        const data = expectSuccess(result);
        expect(data.items).toBeInstanceOf(Array);
        expect(data.pagination).toBeDefined();
        expect(data.pagination.page).toBe(page);
        expect(data.pagination.limit).toBe(limit);
      });

      it('should fail with invalid owner ID', async () => {
        const invalidOwnerId = createInvalidObjectId();
        
        const result = await CharacterService.getCharactersByOwner(invalidOwnerId);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
      });

      it('should handle empty results', async () => {
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.getCharactersByOwner(ownerId);
        
        const data = expectSuccess(result);
        expect(data.items).toHaveLength(0);
        expect(data.pagination.total).toBe(0);
      });
    });

    describe('searchCharacters', () => {
      it('should search characters by name', async () => {
        const searchTerm = 'Fighter';
        const userId = createValidObjectId();
        
        const result = await CharacterService.searchCharacters(searchTerm, userId);
        
        const characters = expectSuccess(result);
        expect(characters).toBeInstanceOf(Array);
      });

      it('should search characters by class', async () => {
        const className = 'wizard';
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharactersByClass(className, userId);
        
        const characters = expectSuccess(result);
        expect(characters).toBeInstanceOf(Array);
      });

      it('should search characters by race', async () => {
        const race = 'elf';
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharactersByRace(race, userId);
        
        const characters = expectSuccess(result);
        expect(characters).toBeInstanceOf(Array);
      });

      it('should filter by character type', async () => {
        const type = 'npc';
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharactersByType(type, userId);
        
        const characters = expectSuccess(result);
        expect(characters).toBeInstanceOf(Array);
      });

      it('should fail with invalid search criteria', async () => {
        const invalidSearchTerm = '';
        const userId = createValidObjectId();
        
        const result = await CharacterService.searchCharacters(invalidSearchTerm, userId);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
      });
    });

    describe('getPublicCharacters', () => {
      it('should retrieve public characters', async () => {
        const result = await CharacterService.getPublicCharacters();
        
        const characters = expectSuccess(result);
        expect(characters).toBeInstanceOf(Array);
      });

      it('should return only public characters', async () => {
        const result = await CharacterService.getPublicCharacters();
        
        const characters = expectSuccess(result);
        characters.forEach(character => {
          expect(character.isPublic).toBe(true);
        });
      });
    });
  });

  describe('Character Statistics and Calculations', () => {
    describe('calculateCharacterStats', () => {
      it('should calculate ability modifiers correctly', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.calculateCharacterStats(characterId, userId);
        
        const stats = expectSuccess(result);
        expect(stats.abilityModifiers).toBeDefined();
        expect(stats.abilityModifiers.strength).toBeTypeOf('number');
      });

      it('should calculate multiclass stats correctly', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.calculateCharacterStats(characterId, userId);
        
        const stats = expectSuccess(result);
        expect(stats.totalLevel).toBeGreaterThan(0);
        expect(stats.proficiencyBonus).toBeGreaterThanOrEqual(2);
      });

      it('should calculate initiative modifier', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.calculateCharacterStats(characterId, userId);
        
        const stats = expectSuccess(result);
        expect(stats.initiativeModifier).toBeTypeOf('number');
      });
    });

    describe('getCharacterSummary', () => {
      it('should return character summary', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharacterSummary(characterId, userId);
        
        const summary = expectSuccess(result);
        expect(summary._id).toBeDefined();
        expect(summary.name).toBeDefined();
        expect(summary.level).toBeGreaterThan(0);
      });

      it('should exclude sensitive data from summary', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        
        const result = await CharacterService.getCharacterSummary(characterId, userId);
        
        const summary = expectSuccess(result);
        expect(summary).not.toHaveProperty('backstory');
        expect(summary).not.toHaveProperty('notes');
      });
    });
  });

  describe('Character Templates and Cloning', () => {
    describe('createCharacterTemplate', () => {
      it('should create template from character', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        const templateName = 'Fighter Template';
        
        const result = await CharacterService.createCharacterTemplate(characterId, userId, templateName);
        
        const template = expectSuccess(result);
        expect(template.name).toBe(templateName);
      });

      it('should fail with invalid character ID', async () => {
        const invalidId = createInvalidObjectId();
        const userId = createValidObjectId();
        const templateName = 'Test Template';
        
        const result = await CharacterService.createCharacterTemplate(invalidId, userId, templateName);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
      });

      it('should fail for unauthorized template creation', async () => {
        const characterId = createValidObjectId();
        const unauthorizedUserId = createValidObjectId();
        const templateName = 'Test Template';
        
        const result = await CharacterService.createCharacterTemplate(characterId, unauthorizedUserId, templateName);
        
        expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });
    });

    describe('cloneCharacter', () => {
      it('should clone character successfully', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        const newName = 'Cloned Character';
        
        const result = await CharacterService.cloneCharacter(characterId, userId, newName);
        
        const clonedCharacter = expectSuccess(result);
        expect(clonedCharacter.name).toBe(newName);
        expect(clonedCharacter._id).not.toBe(characterId);
      });

      it('should reset character-specific data when cloning', async () => {
        const characterId = createValidObjectId();
        const userId = createValidObjectId();
        const newName = 'Cloned Character';
        
        const result = await CharacterService.cloneCharacter(characterId, userId, newName);
        
        const clonedCharacter = expectSuccess(result);
        expect(clonedCharacter.hitPoints.current).toBe(clonedCharacter.hitPoints.maximum);
        expect(clonedCharacter.hitPoints.temporary).toBe(0);
      });

      it('should fail with invalid character ID', async () => {
        const invalidId = createInvalidObjectId();
        const userId = createValidObjectId();
        const newName = 'Test Clone';
        
        const result = await CharacterService.cloneCharacter(invalidId, userId, newName);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
      });
    });

    describe('createCharacterFromTemplate', () => {
      it('should create character from template', async () => {
        const templateData = createMockCharacterPreset();
        const ownerId = createValidObjectId();
        const customizations = { name: 'Custom Character' };
        
        const result = await CharacterService.createCharacterFromTemplate(templateData, ownerId, customizations);
        
        const character = expectSuccess(result);
        expect(character.name).toBe(customizations.name);
        expect(character.class).toBe(templateData.class);
      });

      it('should fail with invalid template data', async () => {
        const invalidTemplate = { name: '', class: 'invalid' } as any;
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.createCharacterFromTemplate(invalidTemplate, ownerId);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_TEMPLATE_DATA);
      });
    });
  });

  describe('Character Validation and Sanitization', () => {
    describe('validateCharacterData', () => {
      it('should validate correct character data', async () => {
        const characterData = createMockCharacterCreation();
        
        const result = await CharacterService.validateCharacterData(characterData);
        
        expectSuccess(result);
      });

      it('should reject invalid ability scores', async () => {
        const invalidData = {
          ...createMockCharacterCreation(),
          abilityScores: {
            ...createMockCharacterCreation().abilityScores,
            strength: 31, // Above maximum
          },
        };
        
        const result = await CharacterService.validateCharacterData(invalidData);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
      });

      it('should reject invalid level combinations', async () => {
        const invalidData = {
          ...createMockCharacterCreation(),
          classes: [
            { class: 'fighter', level: 15, hitDie: 10 },
            { class: 'wizard', level: 10, hitDie: 6 }, // Total level 25 > 20
          ],
        };
        
        const result = await CharacterService.validateCharacterData(invalidData as any);
        
        expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_LEVEL);
      });

      it('should sanitize character input', async () => {
        const unsanitizedData = {
          ...createMockCharacterCreation(),
          name: '  Warrior   ', // Extra whitespace
          backstory: '<script>alert("xss")</script>Valid backstory', // XSS attempt
        };
        
        const result = await CharacterService.validateCharacterData(unsanitizedData);
        
        const sanitized = expectSuccess(result);
        expect(sanitized.name).toBe('Warrior');
        expect(sanitized.backstory).not.toContain('<script>');
      });
    });
  });

  describe('Character Ownership and Permissions', () => {
    describe('checkCharacterOwnership', () => {
      it('should confirm ownership for character owner', async () => {
        const characterId = createValidObjectId();
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.checkCharacterOwnership(characterId, ownerId);
        
        expectSuccess(result);
      });

      it('should deny ownership for non-owner', async () => {
        const characterId = createValidObjectId();
        const nonOwnerId = createValidObjectId();
        
        const result = await CharacterService.checkCharacterOwnership(characterId, nonOwnerId);
        
        expectError(result, CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });

      it('should allow access to public characters', async () => {
        const characterId = createValidObjectId();
        const anyUserId = createValidObjectId();
        
        const result = await CharacterService.checkCharacterAccess(characterId, anyUserId);
        
        expectSuccess(result);
      });
    });

    describe('getCharacterPermissions', () => {
      it('should return full permissions for owner', async () => {
        const characterId = createValidObjectId();
        const ownerId = createValidObjectId();
        
        const result = await CharacterService.getCharacterPermissions(characterId, ownerId);
        
        const permissions = expectSuccess(result);
        expect(permissions.canEdit).toBe(true);
        expect(permissions.canDelete).toBe(true);
        expect(permissions.canShare).toBe(true);
      });

      it('should return limited permissions for non-owner', async () => {
        const characterId = createValidObjectId();
        const viewerId = createValidObjectId();
        
        const result = await CharacterService.getCharacterPermissions(characterId, viewerId);
        
        const permissions = expectSuccess(result);
        expect(permissions.canEdit).toBe(false);
        expect(permissions.canDelete).toBe(false);
        expect(permissions.canView).toBe(true); // Assuming public
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      
      // Mock database connection failure
      const result = await CharacterService.getCharacterById(characterId, userId);
      
      expectError(result, CHARACTER_ERROR_CODES.CONNECTION_ERROR);
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = { random: 'data' } as any;
      const ownerId = createValidObjectId();
      
      const result = await CharacterService.createCharacter(ownerId, malformedData);
      
      expectError(result, CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should handle concurrent modification conflicts', async () => {
      const characterId = createValidObjectId();
      const userId = createValidObjectId();
      const updateData = createMockCharacterUpdate();
      
      const result = await CharacterService.updateCharacter(characterId, userId, updateData);
      
      expectError(result, CHARACTER_ERROR_CODES.OPERATION_FAILED);
    });
  });
});