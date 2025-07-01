/**
 * Character Validation Utils Tests
 */

import { CharacterValidationUtils } from '../../utils/CharacterValidationUtils';
import { CHARACTER_ERROR_CODES } from '../../CharacterServiceErrors';
import { createMockCharacterData } from '../CharacterService.test-helpers';

// Mock validation schemas
jest.mock('../../../validations/character', () => ({
  characterCreationSchema: {
    safeParse: jest.fn(),
  },
  characterUpdateSchema: {
    safeParse: jest.fn(),
  },
}));

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

describe('CharacterValidationUtils', () => {
  const mockCharacterData = createMockCharacterData();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateObjectId', () => {
    it('should validate valid ObjectId', () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValue(true);

      const result = CharacterValidationUtils.validateObjectId('507f1f77bcf86cd799439011', 'character');
      expect(result.success).toBe(true);
    });

    it('should fail for invalid character ID', () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValue(false);

      const result = CharacterValidationUtils.validateObjectId('invalid', 'character');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
    });

    it('should fail for invalid owner ID', () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValue(false);

      const result = CharacterValidationUtils.validateObjectId('invalid', 'owner');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should fail for invalid party ID', () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValue(false);

      const result = CharacterValidationUtils.validateObjectId('invalid', 'party');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_PARTY_ID);
    });
  });

  describe('validateMultipleObjectIds', () => {
    it('should validate multiple valid IDs', () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValue(true);

      const result = CharacterValidationUtils.validateMultipleObjectIds([
        { id: '507f1f77bcf86cd799439011', type: 'character' },
        { id: '507f1f77bcf86cd799439012', type: 'owner' },
      ]);
      expect(result.success).toBe(true);
    });

    it('should fail if any ID is invalid', () => {
      const { Types } = require('mongoose');
      Types.ObjectId.isValid.mockReturnValueOnce(true).mockReturnValueOnce(false);

      const result = CharacterValidationUtils.validateMultipleObjectIds([
        { id: '507f1f77bcf86cd799439011', type: 'character' },
        { id: 'invalid', type: 'owner' },
      ]);
      expect(result.success).toBe(false);
    });
  });

  describe('validateCharacterData', () => {
    it('should validate valid character data', () => {
      const { characterCreationSchema } = require('../../../validations/character');
      characterCreationSchema.safeParse.mockReturnValue({
        success: true,
        data: mockCharacterData,
      });

      const result = CharacterValidationUtils.validateCharacterData(mockCharacterData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacterData);
    });

    it('should fail for invalid character data', () => {
      const { characterCreationSchema } = require('../../../validations/character');
      characterCreationSchema.safeParse.mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid data' }] },
      });

      const result = CharacterValidationUtils.validateCharacterData({});
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should fail for invalid character level > 20', () => {
      const { characterCreationSchema } = require('../../../validations/character');
      characterCreationSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          ...mockCharacterData,
          classes: [{ class: 'fighter', level: 25, hitDie: 10 }],
        },
      });

      const invalidData = {
        ...mockCharacterData,
        classes: [{ class: 'fighter', level: 25, hitDie: 10 }],
      };

      const result = CharacterValidationUtils.validateCharacterData(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_LEVEL);
    });

    it('should fail for duplicate multiclass combination', () => {
      const { characterCreationSchema } = require('../../../validations/character');
      characterCreationSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          ...mockCharacterData,
          classes: [
            { class: 'fighter', level: 5, hitDie: 10 },
            { class: 'fighter', level: 3, hitDie: 10 },
          ],
        },
      });

      const invalidData = {
        ...mockCharacterData,
        classes: [
          { class: 'fighter', level: 5, hitDie: 10 },
          { class: 'fighter', level: 3, hitDie: 10 },
        ],
      };

      const result = CharacterValidationUtils.validateCharacterData(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_MULTICLASS_COMBINATION);
    });
  });

  describe('validateUpdateData', () => {
    it('should validate valid update data', () => {
      const { characterUpdateSchema } = require('../../../validations/character');
      characterUpdateSchema.safeParse.mockReturnValue({
        success: true,
        data: { name: 'Updated' },
      });

      const result = CharacterValidationUtils.validateUpdateData({ name: 'Updated' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Updated' });
    });

    it('should fail for invalid update data', () => {
      const { characterUpdateSchema } = require('../../../validations/character');
      characterUpdateSchema.safeParse.mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Invalid update' }] },
      });

      const result = CharacterValidationUtils.validateUpdateData({});
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });
  });

  describe('validateSearchCriteria', () => {
    it('should validate valid search term', () => {
      const result = CharacterValidationUtils.validateSearchCriteria('gandalf');
      expect(result.success).toBe(true);
      expect(result.data).toBe('gandalf');
    });

    it('should trim whitespace', () => {
      const result = CharacterValidationUtils.validateSearchCriteria('  gandalf  ');
      expect(result.success).toBe(true);
      expect(result.data).toBe('gandalf');
    });

    it('should fail for empty search term', () => {
      const result = CharacterValidationUtils.validateSearchCriteria('');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
    });

    it('should fail for whitespace-only search term', () => {
      const result = CharacterValidationUtils.validateSearchCriteria('   ');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
    });
  });

  describe('validatePagination', () => {
    it('should use default values when not provided', () => {
      const result = CharacterValidationUtils.validatePagination();
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        page: 1,
        limit: 20,
        skip: 0,
      });
    });

    it('should handle custom pagination values', () => {
      const result = CharacterValidationUtils.validatePagination(3, 10);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        page: 3,
        limit: 10,
        skip: 20,
      });
    });

    it('should enforce minimum values', () => {
      const result = CharacterValidationUtils.validatePagination(0, 0);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        page: 1,
        limit: 1,
        skip: 0,
      });
    });

    it('should enforce maximum limit', () => {
      const result = CharacterValidationUtils.validatePagination(1, 200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        page: 1,
        limit: 100,
        skip: 0,
      });
    });
  });

  describe('validateCharacterLevel', () => {
    it('should validate valid levels', () => {
      const result1 = CharacterValidationUtils.validateCharacterLevel(1);
      expect(result1.success).toBe(true);

      const result2 = CharacterValidationUtils.validateCharacterLevel(10);
      expect(result2.success).toBe(true);

      const result3 = CharacterValidationUtils.validateCharacterLevel(20);
      expect(result3.success).toBe(true);
    });

    it('should fail for level below 1', () => {
      const result = CharacterValidationUtils.validateCharacterLevel(0);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_LEVEL);
    });

    it('should fail for level above 20', () => {
      const result = CharacterValidationUtils.validateCharacterLevel(21);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_LEVEL);
    });
  });

  describe('validateCharacterLimit', () => {
    it('should pass when under limit', () => {
      const result = CharacterValidationUtils.validateCharacterLimit(5, 10);
      expect(result.success).toBe(true);
    });

    it('should fail when at limit', () => {
      const result = CharacterValidationUtils.validateCharacterLimit(10, 10);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
    });

    it('should fail when over limit', () => {
      const result = CharacterValidationUtils.validateCharacterLimit(15, 10);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
    });

    it('should use default limit when not provided', () => {
      const result = CharacterValidationUtils.validateCharacterLimit(10);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
    });
  });
});