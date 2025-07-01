/**
 * Comprehensive Character Service Tests
 *
 * Tests all major functionality of the CharacterService facade and its modules
 * to achieve high test coverage and meet PR requirements.
 */

import { CharacterService } from '../CharacterService';
import { CHARACTER_ERROR_CODES } from '../CharacterServiceErrors';
import { Character } from '../../models/Character';
import { createMockCharacter, createMockCharacterData } from './CharacterService.test-helpers';
import type { CharacterUpdate } from '../../validations/character';

// Mock the Character model completely
jest.mock('../../models/Character');

// Mock mongoose completely
jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation((_definition, _options) => ({
    pre: jest.fn(),
    post: jest.fn(),
    methods: {},
    statics: {},
    virtual: jest.fn().mockReturnValue({ get: jest.fn(), set: jest.fn() }),
    plugin: jest.fn(),
    index: jest.fn(),
  }));

  mockSchema.Types = {
    ObjectId: 'ObjectId',
    String: 'String',
    Number: 'Number',
    Boolean: 'Boolean',
    Date: 'Date',
    Array: 'Array',
    Mixed: 'Mixed',
  };

  return {
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => ({
        toString: () => id || '507f1f77bcf86cd799439011',
        _id: id || '507f1f77bcf86cd799439011',
      })),
    },
    Schema: mockSchema,
    model: jest.fn().mockReturnValue({
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }),
    connect: jest.fn(),
    connection: {
      readyState: 1,
    },
  };
});

// Set up proper ObjectId validation
beforeAll(() => {
  const mongoose = require('mongoose');
  mongoose.Types.ObjectId.isValid = jest.fn((id: string) => {
    return id && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
  });
});

// Mock all character validation schemas to pass by default
jest.mock('../../validations/character', () => ({
  characterCreationSchema: {
    safeParse: jest.fn((data) => ({ success: true, data })),
  },
  characterUpdateSchema: {
    safeParse: jest.fn((data) => ({ success: true, data })),
  },
}));

describe('CharacterService - Comprehensive Tests', () => {
  const validUserId = '507f1f77bcf86cd799439011';
  const validCharacterId = '507f1f77bcf86cd799439012';
  const mockCharacterData = createMockCharacterData();

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default successful mocks
    (Character.countDocuments as jest.Mock).mockResolvedValue(5);
    (Character.findById as jest.Mock).mockResolvedValue(createMockCharacter());
    (Character.findByIdAndUpdate as jest.Mock).mockResolvedValue(createMockCharacter());
    (Character.findByIdAndDelete as jest.Mock).mockResolvedValue(createMockCharacter());
    (Character.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([createMockCharacter()]),
    });

    // Mock Character constructor
    const mockSave = jest.fn().mockResolvedValue(createMockCharacter());
    (Character as any) = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
  });

  describe('CRUD Operations', () => {
    describe('createCharacter', () => {
      it('should create character successfully', async () => {
        const result = await CharacterService.createCharacter(validUserId, mockCharacterData);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should validate input data', async () => {
        const invalidData = { ...mockCharacterData, name: '' };
        const { characterCreationSchema } = require('../../validations/character');
        characterCreationSchema.safeParse.mockReturnValueOnce({
          success: false,
          error: { errors: [{ message: 'Name is required' }] }
        });

        const result = await CharacterService.createCharacter(validUserId, invalidData);

        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
      });

      it('should check character limits', async () => {
        (Character.countDocuments as jest.Mock).mockResolvedValue(10);

        const result = await CharacterService.createCharacter(validUserId, mockCharacterData);

        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
      });
    });

    describe('getCharacterById', () => {
      it('should get character with valid access', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should allow access to public characters', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => 'different-user' } as any;
        mockCharacter.isPublic = true;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);

        expect(result.success).toBe(true);
      });

      it('should deny access to private characters', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => 'different-user' } as any;
        mockCharacter.isPublic = false;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.getCharacterById(validCharacterId, validUserId);

        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });
    });

    describe('updateCharacter', () => {
      it('should update character successfully', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const updateData: CharacterUpdate = { name: 'Updated Name' };
        const result = await CharacterService.updateCharacter(validCharacterId, validUserId, updateData);

        expect(result.success).toBe(true);
      });

      it('should require ownership for updates', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => 'different-user' } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const updateData: CharacterUpdate = { name: 'Updated Name' };
        const result = await CharacterService.updateCharacter(validCharacterId, validUserId, updateData);

        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });
    });

    describe('deleteCharacter', () => {
      it('should delete character successfully', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.deleteCharacter(validCharacterId, validUserId);

        expect(result.success).toBe(true);
      });

      it('should require ownership for deletion', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => 'different-user' } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.deleteCharacter(validCharacterId, validUserId);

        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
      });
    });
  });

  describe('Search and Filtering', () => {
    describe('getCharactersByOwner', () => {
      it('should get characters with pagination', async () => {
        const mockCharacters = [createMockCharacter(), createMockCharacter()];
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockCharacters),
        };
        (Character.find as jest.Mock).mockReturnValue(mockFind);
        (Character.countDocuments as jest.Mock).mockResolvedValue(25);

        const result = await CharacterService.getCharactersByOwner(validUserId, 1, 10);

        expect(result.success).toBe(true);
        expect(result.data.items).toEqual(mockCharacters);
        expect(result.data.pagination.total).toBe(25);
      });
    });

    describe('searchCharacters', () => {
      it('should search characters by text', async () => {
        const mockCharacters = [createMockCharacter()];
        const mockFind = {
          sort: jest.fn().mockResolvedValue(mockCharacters),
        };
        (Character.find as jest.Mock).mockReturnValue(mockFind);

        const result = await CharacterService.searchCharacters('Gandalf', validUserId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCharacters);
      });

      it('should reject empty search terms', async () => {
        const result = await CharacterService.searchCharacters('', validUserId);

        expect(result.success).toBe(false);
        expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
      });
    });

    describe('filtering methods', () => {
      it('should get characters by class', async () => {
        const mockCharacters = [createMockCharacter()];
        const mockFind = {
          sort: jest.fn().mockResolvedValue(mockCharacters),
        };
        (Character.find as jest.Mock).mockReturnValue(mockFind);

        const result = await CharacterService.getCharactersByClass('wizard', validUserId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCharacters);
      });

      it('should get characters by race', async () => {
        const mockCharacters = [createMockCharacter()];
        const mockFind = {
          sort: jest.fn().mockResolvedValue(mockCharacters),
        };
        (Character.find as jest.Mock).mockReturnValue(mockFind);

        const result = await CharacterService.getCharactersByRace('elf', validUserId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCharacters);
      });

      it('should get characters by type', async () => {
        const mockCharacters = [createMockCharacter()];
        const mockFind = {
          sort: jest.fn().mockResolvedValue(mockCharacters),
        };
        (Character.find as jest.Mock).mockReturnValue(mockFind);

        const result = await CharacterService.getCharactersByType('pc', validUserId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCharacters);
      });

      it('should get public characters', async () => {
        const mockCharacters = [createMockCharacter()];
        const mockFind = {
          sort: jest.fn().mockResolvedValue(mockCharacters),
        };
        (Character.find as jest.Mock).mockReturnValue(mockFind);

        const result = await CharacterService.getPublicCharacters();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCharacters);
      });
    });
  });

  describe('Statistics and Calculations', () => {
    it('should calculate character stats', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => validUserId } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterService.calculateCharacterStats(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.abilityModifiers).toBeDefined();
      expect(result.data.savingThrows).toBeDefined();
      expect(result.data.skills).toBeDefined();
    });

    it('should get character summary', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => validUserId } as any;
      mockCharacter.toSummary = jest.fn().mockReturnValue({
        _id: validCharacterId,
        name: 'Test Character',
        race: 'human',
        type: 'pc',
        level: 1,
      });
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterService.getCharacterSummary(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Test Character');
    });

    it('should calculate spellcasting stats (stub)', async () => {
      const result = await CharacterService.calculateSpellcastingStats(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data.casterLevel).toBe(0);
    });

    it('should calculate carrying capacity (stub)', async () => {
      const result = await CharacterService.calculateCarryingCapacity(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data.maximum).toBe(240);
    });

    it('should calculate equipment weight (stub)', async () => {
      const result = await CharacterService.calculateEquipmentWeight(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(55);
    });

    it('should calculate experience info (stub)', async () => {
      const result = await CharacterService.calculateExperienceInfo(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data.currentLevel).toBe(1);
    });
  });

  describe('Templates and Bulk Operations', () => {
    describe('createCharacterTemplate', () => {
      it('should create template from character', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.createCharacterTemplate(validCharacterId, validUserId, 'Fighter Template');

        expect(result.success).toBe(true);
        expect(result.data.name).toBe('Fighter Template');
      });
    });

    describe('cloneCharacter', () => {
      it('should clone character successfully', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.cloneCharacter(validCharacterId, validUserId, 'Cloned Character');

        expect(result.success).toBe(true);
      });
    });

    describe('createCharacterFromTemplate', () => {
      it('should create character from template', async () => {
        const templateData = {
          name: 'Template Fighter',
          type: 'pc' as const,
          race: 'human' as const,
          class: 'fighter' as const,
          level: 1,
          abilityScores: {
            strength: 16,
            dexterity: 14,
            constitution: 15,
            intelligence: 10,
            wisdom: 12,
            charisma: 8,
          },
          hitPoints: 12,
          armorClass: 16,
        };

        const result = await CharacterService.createCharacterFromTemplate(templateData, validUserId);

        expect(result.success).toBe(true);
      });
    });

    describe('bulk operations', () => {
      it('should create multiple characters', async () => {
        const charactersData = [mockCharacterData, { ...mockCharacterData, name: 'Character 2' }];

        const result = await CharacterService.createMultipleCharacters(validUserId, charactersData);

        expect(result.success).toBe(true);
        expect(result.data.successful).toHaveLength(2);
        expect(result.data.failed).toHaveLength(0);
      });

      it('should update multiple characters', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const updates = [
          { characterId: validCharacterId, data: { name: 'Updated 1' } },
          { characterId: '507f1f77bcf86cd799439013', data: { name: 'Updated 2' } },
        ];

        const result = await CharacterService.updateMultipleCharacters(validUserId, updates);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
      });

      it('should delete multiple characters', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const characterIds = [validCharacterId, '507f1f77bcf86cd799439013'];

        const result = await CharacterService.deleteMultipleCharacters(validUserId, characterIds);

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validation and Permissions', () => {
    describe('validateCharacterData', () => {
      it('should validate correct character data', async () => {
        const result = await CharacterService.validateCharacterData(mockCharacterData);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
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
    });

    describe('ownership and permissions', () => {
      it('should check character ownership', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.checkCharacterOwnership(validCharacterId, validUserId);

        expect(result.success).toBe(true);
      });

      it('should check character access', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.checkCharacterAccess(validCharacterId, validUserId);

        expect(result.success).toBe(true);
      });

      it('should get character permissions', async () => {
        const mockCharacter = createMockCharacter();
        mockCharacter.ownerId = { toString: () => validUserId } as any;
        (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

        const result = await CharacterService.getCharacterPermissions(validCharacterId, validUserId);

        expect(result.success).toBe(true);
        expect(result.data.canView).toBe(true);
        expect(result.data.canEdit).toBe(true);
        expect(result.data.canDelete).toBe(true);
        expect(result.data.canShare).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ObjectId formats', async () => {
      const result = await CharacterService.getCharacterById('invalid-id', validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
    });

    it('should handle database connection errors', async () => {
      (Character.findById as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const result = await CharacterService.getCharacterById(validCharacterId, validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });

    it('should handle character not found errors', async () => {
      (Character.findById as jest.Mock).mockResolvedValue(null);

      const result = await CharacterService.getCharacterById(validCharacterId, validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
    });
  });
});