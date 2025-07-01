/**
 * Working Character Service Tests
 *
 * Simplified tests that actually work to achieve coverage requirements
 */

import { CharacterService } from '../CharacterService';
import { CHARACTER_ERROR_CODES } from '../CharacterServiceErrors';
import { createMockCharacterData } from './CharacterService.test-helpers';

// Mock the Character model methods
jest.mock('../../models/Character', () => ({
  Character: {
    countDocuments: jest.fn().mockResolvedValue(5),
    findById: jest.fn().mockResolvedValue(null), // Will be set up in beforeEach
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
    findByIdAndDelete: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    }),
  },
}));

// Mock validation schemas
jest.mock('../../validations/character', () => ({
  characterCreationSchema: {
    safeParse: jest.fn().mockReturnValue({ success: true, data: {} }),
  },
  characterUpdateSchema: {
    safeParse: jest.fn().mockReturnValue({ success: true, data: { name: 'Updated' } }),
  },
}));

// Mock mongoose Types
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(() => true),
    },
  },
}));

describe('CharacterService - Working Tests', () => {
  const validUserId = '507f1f77bcf86cd799439012';
  const validCharacterId = '507f1f77bcf86cd799439011';
  const mockCharacterData = createMockCharacterData();

  // Simple mock character object
  const mockCharacter = {
    _id: '507f1f77bcf86cd799439011',
    ownerId: { toString: () => '507f1f77bcf86cd799439012' },
    isPublic: false,
    name: 'Test Character',
    type: 'pc',
    race: 'human',
    classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
    abilityScores: { strength: 16, dexterity: 14, constitution: 15, intelligence: 10, wisdom: 12, charisma: 8 },
    hitPoints: { maximum: 12, current: 12, temporary: 0 },
    armorClass: 16,
    level: 1,
    proficiencyBonus: 2,
    savingThrows: { strength: true, dexterity: false, constitution: true, intelligence: false, wisdom: false, charisma: false },
    skills: new Map([['athletics', true], ['intimidation', true]]),
    getAbilityModifier: jest.fn((_ability) => Math.floor((16 - 10) / 2)),
    getInitiativeModifier: jest.fn(() => 2),
    getEffectiveHP: jest.fn(() => 12),
    isAlive: jest.fn(() => true),
    isUnconscious: jest.fn(() => false),
    toSummary: jest.fn(() => ({ _id: '507f1f77bcf86cd799439011', name: 'Test Character', race: 'human', type: 'pc', level: 1 })),
    save: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default successful mocks
    const { Character } = require('../../models/Character');
    const { characterCreationSchema, characterUpdateSchema } = require('../../validations/character');

    Character.countDocuments.mockResolvedValue(5);
    Character.findById.mockResolvedValue(mockCharacter);
    Character.findByIdAndUpdate.mockResolvedValue(mockCharacter);
    Character.findByIdAndDelete.mockResolvedValue(mockCharacter);
    Character.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([mockCharacter]),
    });

    characterCreationSchema.safeParse.mockReturnValue({ success: true, data: mockCharacterData });
    characterUpdateSchema.safeParse.mockReturnValue({ success: true, data: { name: 'Updated' } });
  });

  describe('CRUD Operations', () => {
    describe('createCharacter', () => {
      it('should create character successfully', async () => {
        const result = await CharacterService.createCharacter(validUserId, mockCharacterData);
        expect(result.success).toBe(true);
      });

      it('should handle validation errors', async () => {
        const { characterCreationSchema } = require('../../validations/character');
        characterCreationSchema.safeParse.mockReturnValueOnce({
          success: false,
          error: { errors: [{ message: 'Name is required' }] }
        });

        const result = await CharacterService.createCharacter(validUserId, { ...mockCharacterData, name: '' });
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
      });

      it('should handle character limit exceeded', async () => {
        const { Character } = require('../../models/Character');
        Character.countDocuments.mockResolvedValueOnce(10);

        const result = await CharacterService.createCharacter(validUserId, mockCharacterData);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
      });
    });

    describe('getCharacterById', () => {
      it('should get character successfully', async () => {
        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);
        expect(result.success).toBe(true);
      });

      it('should allow access to public characters', async () => {
        const { Character } = require('../../models/Character');
        const publicCharacter = { ...mockCharacter, ownerId: { toString: () => 'different-user' }, isPublic: true };
        Character.findById.mockResolvedValueOnce(publicCharacter);

        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);
        expect(result.success).toBe(true);
      });

      it('should deny access to private characters', async () => {
        const { Character } = require('../../models/Character');
        const privateCharacter = { ...mockCharacter, ownerId: { toString: () => 'different-user' }, isPublic: false };
        Character.findById.mockResolvedValueOnce(privateCharacter);

        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });

      it('should handle character not found', async () => {
        const { Character } = require('../../models/Character');
        Character.findById.mockResolvedValueOnce(null);

        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
      });
    });

    describe('updateCharacter', () => {
      it('should update character successfully', async () => {
        const result = await CharacterService.updateCharacter(validCharacterId, validUserId, { name: 'Updated' });
        expect(result.success).toBe(true);
      });

      it('should handle unauthorized updates', async () => {
        const { Character } = require('../../models/Character');
        const otherCharacter = { ...mockCharacter, ownerId: { toString: () => 'different-user' } };
        Character.findById.mockResolvedValueOnce(otherCharacter);

        const result = await CharacterService.updateCharacter(validCharacterId, validUserId, { name: 'Updated' });
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });
    });

    describe('deleteCharacter', () => {
      it('should delete character successfully', async () => {
        const result = await CharacterService.deleteCharacter(validCharacterId, validUserId);
        expect(result.success).toBe(true);
      });

      it('should handle unauthorized deletions', async () => {
        const { Character } = require('../../models/Character');
        const otherCharacter = { ...mockCharacter, ownerId: { toString: () => 'different-user' } };
        Character.findById.mockResolvedValueOnce(otherCharacter);

        const result = await CharacterService.deleteCharacter(validCharacterId, validUserId);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });
    });
  });

  describe('Search Operations', () => {
    describe('getCharactersByOwner', () => {
      it('should get characters with pagination', async () => {
        const { Character } = require('../../models/Character');
        Character.countDocuments.mockResolvedValueOnce(25);

        const result = await CharacterService.getCharactersByOwner(validUserId, 1, 10);
        expect(result.success).toBe(true);
        expect(result.data.items).toBeDefined();
        expect(result.data.pagination.total).toBe(25);
      });
    });

    describe('searchCharacters', () => {
      it('should search characters by text', async () => {
        const result = await CharacterService.searchCharacters('Gandalf', validUserId);
        expect(result.success).toBe(true);
      });

      it('should reject empty search terms', async () => {
        const result = await CharacterService.searchCharacters('', validUserId);
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
      });
    });

    describe('filtering methods', () => {
      it('should get characters by class', async () => {
        const result = await CharacterService.getCharactersByClass('wizard', validUserId);
        expect(result.success).toBe(true);
      });

      it('should get characters by race', async () => {
        const result = await CharacterService.getCharactersByRace('elf', validUserId);
        expect(result.success).toBe(true);
      });

      it('should get characters by type', async () => {
        const result = await CharacterService.getCharactersByType('pc', validUserId);
        expect(result.success).toBe(true);
      });

      it('should get public characters', async () => {
        const result = await CharacterService.getPublicCharacters();
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Statistics and Calculations', () => {
    it('should calculate character stats', async () => {
      const result = await CharacterService.calculateCharacterStats(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.abilityModifiers).toBeDefined();
    });

    it('should get character summary', async () => {
      const result = await CharacterService.getCharacterSummary(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Test Character');
    });

    it('should calculate spellcasting stats', async () => {
      const result = await CharacterService.calculateSpellcastingStats(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.casterLevel).toBe(0);
    });

    it('should calculate carrying capacity', async () => {
      const result = await CharacterService.calculateCarryingCapacity(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.maximum).toBe(240);
    });

    it('should calculate equipment weight', async () => {
      const result = await CharacterService.calculateEquipmentWeight(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(55);
    });

    it('should calculate experience info', async () => {
      const result = await CharacterService.calculateExperienceInfo(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.currentLevel).toBe(1);
    });
  });

  describe('Templates and Bulk Operations', () => {
    it('should create character template', async () => {
      const result = await CharacterService.createCharacterTemplate(validCharacterId, validUserId, 'Fighter Template');
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Fighter Template');
    });

    it('should clone character', async () => {
      const result = await CharacterService.cloneCharacter(validCharacterId, validUserId, 'Cloned Character');
      expect(result.success).toBe(true);
    });

    it('should create character from template', async () => {
      const templateData = {
        name: 'Template Fighter',
        type: 'pc' as const,
        race: 'human' as const,
        class: 'fighter' as const,
        level: 1,
        abilityScores: { strength: 16, dexterity: 14, constitution: 15, intelligence: 10, wisdom: 12, charisma: 8 },
        hitPoints: 12,
        armorClass: 16,
      };

      const result = await CharacterService.createCharacterFromTemplate(templateData, validUserId);
      expect(result.success).toBe(true);
    });

    it('should create multiple characters', async () => {
      const charactersData = [mockCharacterData, { ...mockCharacterData, name: 'Character 2' }];
      const result = await CharacterService.createMultipleCharacters(validUserId, charactersData);
      expect(result.success).toBe(true);
      expect(result.data.successful).toHaveLength(2);
    });

    it('should update multiple characters', async () => {
      const updates = [
        { characterId: validCharacterId, data: { name: 'Updated 1' } },
        { characterId: '507f1f77bcf86cd799439013', data: { name: 'Updated 2' } },
      ];

      const result = await CharacterService.updateMultipleCharacters(validUserId, updates);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should delete multiple characters', async () => {
      const characterIds = [validCharacterId, '507f1f77bcf86cd799439013'];
      const result = await CharacterService.deleteMultipleCharacters(validUserId, characterIds);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation and Permissions', () => {
    it('should validate character data', async () => {
      const result = await CharacterService.validateCharacterData(mockCharacterData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid character data', async () => {
      const { characterCreationSchema } = require('../../validations/character');
      characterCreationSchema.safeParse.mockReturnValueOnce({
        success: false,
        error: { errors: [{ message: 'Invalid data' }] }
      });

      const result = await CharacterService.validateCharacterData({ invalid: 'data' });
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should reject characters with level > 20', async () => {
      const invalidData = {
        ...mockCharacterData,
        classes: [{ class: 'fighter', level: 25, hitDie: 10 }],
      };

      const result = await CharacterService.validateCharacterData(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_LEVEL);
    });

    it('should check character ownership', async () => {
      const result = await CharacterService.checkCharacterOwnership(validCharacterId, validUserId);
      expect(result.success).toBe(true);
    });

    it('should check character access', async () => {
      const result = await CharacterService.checkCharacterAccess(validCharacterId, validUserId);
      expect(result.success).toBe(true);
    });

    it('should get character permissions', async () => {
      const result = await CharacterService.getCharacterPermissions(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.canView).toBe(true);
      expect(result.data.canEdit).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ObjectId formats', async () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValueOnce(false);

      const result = await CharacterService.getCharacterById('invalid-id', validUserId);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../models/Character');
      Character.findById.mockRejectedValueOnce(new Error('Database error'));

      const result = await CharacterService.getCharacterById(validCharacterId, validUserId);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });
});