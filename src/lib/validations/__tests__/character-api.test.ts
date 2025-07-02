import {
  characterSchema,
  characterSummarySchema,
  characterCombatSchema,
  getCharacterByIdSchema,
  getCharactersByOwnerSchema,
  getCharactersByPartySchema,
} from '../character';
import {
  createValidCompleteCharacter,
  createValidSummary,
  createValidCombatData,
} from './character-test-helpers';

describe('Character API and Complete Schemas', () => {
  describe('characterSchema', () => {
    const validCompleteCharacter = createValidCompleteCharacter();

    it('should validate complete character with database fields', () => {
      expect(() => characterSchema.parse(validCompleteCharacter)).not.toThrow();
    });

    it('should require ownerId', () => {
      const withoutOwner = {
        ...validCompleteCharacter,
        ownerId: undefined,
      };

      expect(() => characterSchema.parse(withoutOwner)).toThrow();
    });

    it('should validate ObjectId format', () => {
      const invalidObjectId = {
        ...validCompleteCharacter,
        ownerId: 'invalid-object-id',
      };

      expect(() => characterSchema.parse(invalidObjectId)).toThrow();
    });

    it('should handle optional database fields', () => {
      const result = characterSchema.parse(validCompleteCharacter);
      expect(result.isPublic).toBe(false); // default
      expect(result.createdAt).toBeDefined(); // default
      expect(result.updatedAt).toBeDefined(); // default
    });
  });

  describe('characterSummarySchema', () => {
    const validSummary = createValidSummary();

    it('should validate character summary', () => {
      expect(() => characterSummarySchema.parse(validSummary)).not.toThrow();
    });

    it('should require essential fields for summary', () => {
      const incompleteSummary = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Incomplete',
        // missing required fields
      };

      expect(() => characterSummarySchema.parse(incompleteSummary)).toThrow();
    });

    it('should validate level constraints in summary', () => {
      const invalidLevel = {
        ...validSummary,
        level: 25, // above maximum
      };

      expect(() => characterSummarySchema.parse(invalidLevel)).toThrow();
    });
  });

  describe('characterCombatSchema', () => {
    const validCombatData = createValidCombatData();

    it('should validate combat state data', () => {
      expect(() => characterCombatSchema.parse(validCombatData)).not.toThrow();
    });

    it('should validate initiative range', () => {
      const invalidInitiative = {
        ...validCombatData,
        initiative: -15, // below minimum
      };

      expect(() => characterCombatSchema.parse(invalidInitiative)).toThrow();
    });

    it('should validate death saves constraints', () => {
      const invalidDeathSaves = {
        ...validCombatData,
        deathSaves: {
          successes: 5, // above maximum
          failures: 2,
        },
      };

      expect(() => characterCombatSchema.parse(invalidDeathSaves)).toThrow();
    });

    it('should handle default values in combat', () => {
      const minimalCombat = {
        characterId: '507f1f77bcf86cd799439011',
        encounterId: '507f1f77bcf86cd799439012',
        initiative: 10,
        currentHitPoints: 20,
        turnOrder: 1,
      };

      const result = characterCombatSchema.parse(minimalCombat);
      expect(result.temporaryHitPoints).toBe(0); // default
      expect(result.conditions).toEqual([]); // default
      expect(result.isStable).toBe(true); // default
      expect(result.deathSaves.successes).toBe(0); // default
      expect(result.deathSaves.failures).toBe(0); // default
    });

    it('should validate conditions array limit', () => {
      const tooManyConditions = {
        ...validCombatData,
        conditions: Array.from({ length: 21 }, () => 'condition'),
      };

      expect(() =>
        characterCombatSchema.parse(tooManyConditions)
      ).toThrow();
    });

    it('should validate concentration spell level', () => {
      const invalidConcentration = {
        ...validCombatData,
        concentration: {
          spellName: 'Test Spell',
          spellLevel: 10, // above maximum
          duration: '1 hour',
        },
      };

      expect(() =>
        characterCombatSchema.parse(invalidConcentration)
      ).toThrow();
    });
  });

  describe('API Schemas', () => {
    describe('getCharacterByIdSchema', () => {
      it('should validate ObjectId for character lookup', () => {
        const validRequest = {
          id: '507f1f77bcf86cd799439011',
        };

        expect(() =>
          getCharacterByIdSchema.parse(validRequest)
        ).not.toThrow();
      });

      it('should reject invalid ObjectId format', () => {
        const invalidRequest = {
          id: 'invalid-id',
        };

        expect(() => getCharacterByIdSchema.parse(invalidRequest)).toThrow();
      });
    });

    describe('getCharactersByOwnerSchema', () => {
      it('should validate owner query with pagination', () => {
        const validRequest = {
          ownerId: '507f1f77bcf86cd799439011',
          page: 2,
          limit: 10,
        };

        expect(() =>
          getCharactersByOwnerSchema.parse(validRequest)
        ).not.toThrow();
      });

      it('should use default pagination values', () => {
        const minimalRequest = {
          ownerId: '507f1f77bcf86cd799439011',
        };

        const result = getCharactersByOwnerSchema.parse(minimalRequest);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should validate pagination limits', () => {
        const invalidRequest = {
          ownerId: '507f1f77bcf86cd799439011',
          page: 0, // below minimum
          limit: 100,
        };

        expect(() =>
          getCharactersByOwnerSchema.parse(invalidRequest)
        ).toThrow();
      });
    });

    describe('getCharactersByPartySchema', () => {
      it('should validate party query', () => {
        const validRequest = {
          partyId: '507f1f77bcf86cd799439011',
        };

        expect(() =>
          getCharactersByPartySchema.parse(validRequest)
        ).not.toThrow();
      });
    });
  });
});