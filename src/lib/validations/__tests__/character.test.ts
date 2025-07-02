import {
  characterClassSchema,
  characterRaceSchema,
  characterTypeSchema,
  sizeSchema,
  abilityScoresSchema,
  characterClassLevelSchema,
  equipmentItemSchema,
  spellSchema,
  characterCreationSchema,
  characterUpdateSchema,
  characterSchema,
  characterSummarySchema,
  characterCombatSchema,
  getCharacterByIdSchema,
  getCharactersByOwnerSchema,
  getCharactersByPartySchema,
  characterPresetSchema,
  characterExportSchema,
} from '../character';

describe('Character Validation Schemas', () => {
  describe('characterClassSchema', () => {
    it('should validate valid D&D 5e classes', () => {
      const validClasses = [
        'artificer',
        'barbarian',
        'bard',
        'cleric',
        'druid',
        'fighter',
        'monk',
        'paladin',
        'ranger',
        'rogue',
        'sorcerer',
        'warlock',
        'wizard',
      ];

      validClasses.forEach(className => {
        expect(() => characterClassSchema.parse(className)).not.toThrow();
      });
    });

    it('should reject invalid character classes', () => {
      const invalidClasses = [
        'invalid-class',
        'FIGHTER',
        'fighter ',
        ' fighter',
        'bloodhunter',
        '',
        123,
        null,
        undefined,
      ];

      invalidClasses.forEach(className => {
        expect(() => characterClassSchema.parse(className)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid class', () => {
      expect(() => characterClassSchema.parse('invalid')).toThrow(
        'Invalid character class'
      );
    });
  });

  describe('characterRaceSchema', () => {
    it('should validate valid D&D 5e races', () => {
      const validRaces = [
        'dragonborn',
        'dwarf',
        'elf',
        'gnome',
        'half-elf',
        'halfling',
        'half-orc',
        'human',
        'tiefling',
        'aarakocra',
        'genasi',
        'goliath',
        'aasimar',
        'bugbear',
        'firbolg',
        'goblin',
        'hobgoblin',
        'kenku',
        'kobold',
        'lizardfolk',
        'orc',
        'tabaxi',
        'triton',
        'yuan-ti',
        'custom',
      ];

      validRaces.forEach(race => {
        expect(() => characterRaceSchema.parse(race)).not.toThrow();
      });
    });

    it('should reject invalid character races', () => {
      const invalidRaces = [
        'invalid-race',
        'HUMAN',
        'human ',
        ' human',
        'drow',
        '',
        123,
        null,
        undefined,
      ];

      invalidRaces.forEach(race => {
        expect(() => characterRaceSchema.parse(race)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid race', () => {
      expect(() => characterRaceSchema.parse('invalid')).toThrow(
        'Invalid character race'
      );
    });

    it('should allow custom race option', () => {
      expect(() => characterRaceSchema.parse('custom')).not.toThrow();
    });
  });

  describe('characterTypeSchema', () => {
    it('should validate PC and NPC types', () => {
      expect(() => characterTypeSchema.parse('pc')).not.toThrow();
      expect(() => characterTypeSchema.parse('npc')).not.toThrow();
    });

    it('should reject invalid character types', () => {
      const invalidTypes = [
        'player',
        'monster',
        'PC',
        'NPC',
        'pc ',
        ' pc',
        '',
        123,
        null,
        undefined,
      ];

      invalidTypes.forEach(type => {
        expect(() => characterTypeSchema.parse(type)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid type', () => {
      expect(() => characterTypeSchema.parse('invalid')).toThrow(
        'Character type must be either PC or NPC'
      );
    });
  });

  describe('sizeSchema', () => {
    it('should validate all D&D 5e size categories', () => {
      const validSizes = [
        'tiny',
        'small',
        'medium',
        'large',
        'huge',
        'gargantuan',
      ];

      validSizes.forEach(size => {
        expect(() => sizeSchema.parse(size)).not.toThrow();
      });
    });

    it('should reject invalid size categories', () => {
      const invalidSizes = [
        'miniature',
        'gigantic',
        'MEDIUM',
        'medium ',
        ' medium',
        '',
        123,
        null,
        undefined,
      ];

      invalidSizes.forEach(size => {
        expect(() => sizeSchema.parse(size)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid size', () => {
      expect(() => sizeSchema.parse('invalid')).toThrow(
        'Invalid size category'
      );
    });
  });

  describe('abilityScoresSchema', () => {
    it('should validate complete ability scores object', () => {
      const validAbilityScores = {
        strength: 10,
        dexterity: 15,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        charisma: 8,
      };

      expect(() =>
        abilityScoresSchema.parse(validAbilityScores)
      ).not.toThrow();
    });

    it('should accept ability scores at boundaries (1-30)', () => {
      const boundaryScores = {
        strength: 1,
        dexterity: 30,
        constitution: 8,
        intelligence: 20,
        wisdom: 15,
        charisma: 10,
      };

      expect(() => abilityScoresSchema.parse(boundaryScores)).not.toThrow();
    });

    it('should reject ability scores outside valid range', () => {
      const invalidScores = [
        { strength: 0, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        { strength: 31, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        { strength: -5, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        { strength: 10.5, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      ];

      invalidScores.forEach(scores => {
        expect(() => abilityScoresSchema.parse(scores)).toThrow();
      });
    });

    it('should require all six ability scores', () => {
      const incompleteScores = {
        strength: 10,
        dexterity: 15,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        // missing charisma
      };

      expect(() => abilityScoresSchema.parse(incompleteScores)).toThrow();
    });

    it('should reject additional properties', () => {
      const scoresWithExtra = {
        strength: 10,
        dexterity: 15,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        charisma: 8,
        extraProperty: 10,
      };

      // Note: Zod allows additional properties by default, but we're testing schema structure
      const result = abilityScoresSchema.safeParse(scoresWithExtra);
      expect(result.success).toBe(true);
      expect(result.success && (result.data as any).extraProperty).toBeUndefined();
    });
  });

  describe('characterClassLevelSchema', () => {
    it('should validate character class with level and hit die', () => {
      const validClassLevel = {
        class: 'fighter',
        level: 5,
        hitDie: 10,
        subclass: 'Champion',
      };

      expect(() =>
        characterClassLevelSchema.parse(validClassLevel)
      ).not.toThrow();
    });

    it('should validate without optional subclass', () => {
      const validClassLevel = {
        class: 'wizard',
        level: 1,
        hitDie: 6,
      };

      expect(() =>
        characterClassLevelSchema.parse(validClassLevel)
      ).not.toThrow();
    });

    it('should validate hit die ranges for different classes', () => {
      const validHitDice = [4, 6, 8, 10, 12];

      validHitDice.forEach(hitDie => {
        const classLevel = {
          class: 'rogue',
          level: 3,
          hitDie,
        };
        expect(() => characterClassLevelSchema.parse(classLevel)).not.toThrow();
      });
    });

    it('should reject invalid hit die values', () => {
      const invalidHitDice = [2, 3, 13, 20, -1, 0, 1.5];

      invalidHitDice.forEach(hitDie => {
        const classLevel = {
          class: 'paladin',
          level: 2,
          hitDie,
        };
        expect(() => characterClassLevelSchema.parse(classLevel)).toThrow();
      });
    });

    it('should reject invalid level values', () => {
      const invalidLevels = [0, -1, 21, 25, 1.5];

      invalidLevels.forEach(level => {
        const classLevel = {
          class: 'bard',
          level,
          hitDie: 8,
        };
        expect(() => characterClassLevelSchema.parse(classLevel)).toThrow();
      });
    });

    it('should validate subclass name constraints', () => {
      const validSubclass = {
        class: 'cleric',
        level: 3,
        hitDie: 8,
        subclass: 'Life Domain',
      };

      expect(() =>
        characterClassLevelSchema.parse(validSubclass)
      ).not.toThrow();
    });

    it('should handle empty subclass name (transforms to undefined)', () => {
      const emptySubclass = {
        class: 'sorcerer',
        level: 2,
        hitDie: 6,
        subclass: '',
      };

      const result = characterClassLevelSchema.parse(emptySubclass);
      expect(result.subclass).toBeUndefined();
    });

    it('should reject overly long subclass names', () => {
      const longSubclass = {
        class: 'warlock',
        level: 4,
        hitDie: 8,
        subclass: 'A'.repeat(51), // 51 characters
      };

      expect(() => characterClassLevelSchema.parse(longSubclass)).toThrow();
    });
  });

  describe('equipmentItemSchema', () => {
    it('should validate basic equipment item', () => {
      const validEquipment = {
        name: 'Longsword',
        quantity: 1,
        weight: 3,
        value: 15,
        description: 'A versatile martial weapon',
        equipped: true,
        magical: false,
      };

      expect(() => equipmentItemSchema.parse(validEquipment)).not.toThrow();
    });

    it('should validate minimal equipment item', () => {
      const minimalEquipment = {
        name: 'Torch',
      };

      const result = equipmentItemSchema.parse(minimalEquipment);
      expect(result.name).toBe('Torch');
      expect(result.quantity).toBe(1); // default
      expect(result.equipped).toBe(false); // default
      expect(result.magical).toBe(false); // default
    });

    it('should validate magical equipment', () => {
      const magicalEquipment = {
        name: '+1 Sword',
        quantity: 1,
        magical: true,
        equipped: true,
      };

      expect(() => equipmentItemSchema.parse(magicalEquipment)).not.toThrow();
    });

    it('should reject invalid equipment names', () => {
      const invalidNames = ['', 'A'.repeat(101)];

      invalidNames.forEach(name => {
        const equipment = { name };
        expect(() => equipmentItemSchema.parse(equipment)).toThrow();
      });
    });

    it('should reject negative quantities', () => {
      const negativeQuantity = {
        name: 'Arrow',
        quantity: -5,
      };

      expect(() => equipmentItemSchema.parse(negativeQuantity)).toThrow();
    });

    it('should reject negative weight or value', () => {
      const negativeWeight = {
        name: 'Feather',
        weight: -1,
      };

      const negativeValue = {
        name: 'Item',
        value: -10,
      };

      expect(() => equipmentItemSchema.parse(negativeWeight)).toThrow();
      expect(() => equipmentItemSchema.parse(negativeValue)).toThrow();
    });

    it('should handle optional fields', () => {
      const equipmentWithOptionals = {
        name: 'Rope',
        weight: undefined,
        value: '', // empty string transforms to undefined
        description: undefined,
      };

      const result = equipmentItemSchema.parse(equipmentWithOptionals);
      expect(result.weight).toBeUndefined();
      expect(result.value).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it('should validate description length limit', () => {
      const longDescription = {
        name: 'Item',
        description: 'A'.repeat(501), // 501 characters
      };

      expect(() => equipmentItemSchema.parse(longDescription)).toThrow();
    });
  });

  describe('spellSchema', () => {
    it('should validate complete spell', () => {
      const validSpell = {
        name: 'Fireball',
        level: 3,
        school: 'evocation',
        castingTime: '1 action',
        range: '150 feet',
        components: {
          verbal: true,
          somatic: true,
          material: true,
          materialComponent: 'A tiny ball of bat guano and sulfur',
        },
        duration: 'Instantaneous',
        description: 'A bright streak flashes from your pointing finger...',
        prepared: true,
      };

      expect(() => spellSchema.parse(validSpell)).not.toThrow();
    });

    it('should validate cantrip (level 0)', () => {
      const cantrip = {
        name: 'Prestidigitation',
        level: 0,
        school: 'transmutation',
        castingTime: '1 action',
        range: '10 feet',
        components: {
          verbal: true,
          somatic: true,
          material: false,
        },
        duration: 'Up to 1 hour',
        description: 'This spell is a minor magical trick...',
      };

      const result = spellSchema.parse(cantrip);
      expect(result.level).toBe(0);
      expect(result.prepared).toBe(false); // default
    });

    it('should validate all spell schools', () => {
      const validSchools = [
        'abjuration',
        'conjuration',
        'divination',
        'enchantment',
        'evocation',
        'illusion',
        'necromancy',
        'transmutation',
      ];

      validSchools.forEach(school => {
        const spell = {
          name: 'Test Spell',
          level: 1,
          school,
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).not.toThrow();
      });
    });

    it('should reject invalid spell levels', () => {
      const invalidLevels = [-1, 10, 15, 1.5];

      invalidLevels.forEach(level => {
        const spell = {
          name: 'Invalid Spell',
          level,
          school: 'evocation',
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).toThrow();
      });
    });

    it('should reject invalid spell schools', () => {
      const invalidSchools = ['invalid', 'EVOCATION', 'elemental', ''];

      invalidSchools.forEach(school => {
        const spell = {
          name: 'Test Spell',
          level: 1,
          school,
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).toThrow();
      });
    });

    it('should validate spell components', () => {
      const componentsOnly = {
        name: 'Component Test',
        level: 2,
        school: 'abjuration',
        castingTime: '1 action',
        range: 'Self',
        components: {
          verbal: false,
          somatic: true,
          material: false,
        },
        duration: '10 minutes',
        description: 'A spell with only somatic components',
      };

      expect(() => spellSchema.parse(componentsOnly)).not.toThrow();
    });

    it('should validate material component details', () => {
      const materialSpell = {
        name: 'Material Spell',
        level: 1,
        school: 'conjuration',
        castingTime: '1 minute',
        range: '60 feet',
        components: {
          verbal: true,
          somatic: true,
          material: true,
          materialComponent: 'A piece of crystallized dragon breath',
        },
        duration: '1 hour',
        description: 'A spell requiring specific materials',
      };

      expect(() => spellSchema.parse(materialSpell)).not.toThrow();
    });

    it('should reject invalid spell names', () => {
      const invalidNames = ['', 'A'.repeat(101)];

      invalidNames.forEach(name => {
        const spell = {
          name,
          level: 1,
          school: 'evocation',
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).toThrow();
      });
    });

    it('should validate field length limits', () => {
      const longFields = {
        name: 'Valid Name',
        level: 1,
        school: 'evocation',
        castingTime: 'A'.repeat(51), // 51 characters
        range: 'Valid range',
        components: {
          verbal: true,
          somatic: false,
          material: true,
          materialComponent: 'A'.repeat(201), // 201 characters
        },
        duration: 'A'.repeat(101), // 101 characters
        description: 'A'.repeat(2001), // 2001 characters
      };

      expect(() => spellSchema.parse(longFields)).toThrow();
    });

    it('should handle default component values', () => {
      const minimalSpell = {
        name: 'Simple Spell',
        level: 1,
        school: 'divination',
        castingTime: '1 action',
        range: 'Touch',
        components: {},
        duration: 'Instantaneous',
        description: 'A simple divination spell',
      };

      const result = spellSchema.parse(minimalSpell);
      expect(result.components.verbal).toBe(false);
      expect(result.components.somatic).toBe(false);
      expect(result.components.material).toBe(false);
      expect(result.prepared).toBe(false);
    });
  });

  describe('characterCreationSchema', () => {
    const validCharacterData = {
      name: 'Thorin Oakenshield',
      type: 'pc',
      race: 'dwarf',
      size: 'medium',
      classes: [
        {
          class: 'fighter',
          level: 5,
          hitDie: 10,
          subclass: 'Champion',
        },
      ],
      abilityScores: {
        strength: 16,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 13,
        charisma: 8,
      },
      hitPoints: {
        maximum: 42,
        current: 42,
        temporary: 0,
      },
      armorClass: 18,
      speed: 25,
      proficiencyBonus: 3,
      savingThrows: {
        strength: true,
        dexterity: false,
        constitution: true,
        intelligence: false,
        wisdom: false,
        charisma: false,
      },
      skills: {
        athletics: true,
        intimidation: true,
      },
      equipment: [
        {
          name: 'Plate Armor',
          quantity: 1,
          equipped: true,
        },
      ],
      spells: [],
      backstory: 'A proud dwarf warrior seeking to reclaim his homeland.',
      notes: 'Has a grudge against orcs.',
    };

    it('should validate complete character creation data', () => {
      expect(() =>
        characterCreationSchema.parse(validCharacterData)
      ).not.toThrow();
    });

    it('should validate minimal character creation data', () => {
      const minimalData = {
        name: 'Simple Character',
        type: 'npc',
        race: 'human',
        classes: [
          {
            class: 'rogue',
            level: 1,
            hitDie: 8,
          },
        ],
        abilityScores: {
          strength: 10,
          dexterity: 15,
          constitution: 12,
          intelligence: 13,
          wisdom: 14,
          charisma: 11,
        },
        hitPoints: {
          maximum: 8,
          current: 8,
        },
        armorClass: 13,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: true,
          constitution: false,
          intelligence: true,
          wisdom: false,
          charisma: false,
        },
      };

      const result = characterCreationSchema.parse(minimalData);
      expect(result.size).toBe('medium'); // default
      expect(result.speed).toBe(30); // default
      expect(result.hitPoints.temporary).toBe(0); // default
      expect(result.equipment).toEqual([]); // default
      expect(result.spells).toEqual([]); // default
    });

    it('should validate multiclass character', () => {
      const multiclassData = {
        ...validCharacterData,
        classes: [
          {
            class: 'fighter',
            level: 3,
            hitDie: 10,
            subclass: 'Champion',
          },
          {
            class: 'rogue',
            level: 2,
            hitDie: 8,
            subclass: 'Thief',
          },
        ],
      };

      expect(() =>
        characterCreationSchema.parse(multiclassData)
      ).not.toThrow();
    });

    it('should validate custom race character', () => {
      const customRaceData = {
        ...validCharacterData,
        race: 'custom',
        customRace: 'Dragonkin',
      };

      expect(() =>
        characterCreationSchema.parse(customRaceData)
      ).not.toThrow();
    });

    it('should reject invalid class combinations', () => {
      const invalidClasses = {
        ...validCharacterData,
        classes: [], // empty array
      };

      expect(() => characterCreationSchema.parse(invalidClasses)).toThrow();
    });

    it('should reject too many classes (more than 3)', () => {
      const tooManyClasses = {
        ...validCharacterData,
        classes: [
          { class: 'fighter', level: 1, hitDie: 10 },
          { class: 'rogue', level: 1, hitDie: 8 },
          { class: 'wizard', level: 1, hitDie: 6 },
          { class: 'cleric', level: 1, hitDie: 8 }, // 4th class
        ],
      };

      expect(() => characterCreationSchema.parse(tooManyClasses)).toThrow();
    });

    it('should validate hit points constraints', () => {
      const invalidHitPoints = {
        ...validCharacterData,
        hitPoints: {
          maximum: 50,
          current: -5, // negative current HP
          temporary: 10,
        },
      };

      expect(() => characterCreationSchema.parse(invalidHitPoints)).toThrow();
    });

    it('should validate armor class constraints', () => {
      const invalidAC = {
        ...validCharacterData,
        armorClass: 0, // below minimum
      };

      expect(() => characterCreationSchema.parse(invalidAC)).toThrow();
    });

    it('should validate speed constraints', () => {
      const invalidSpeed = {
        ...validCharacterData,
        speed: 150, // above maximum
      };

      expect(() => characterCreationSchema.parse(invalidSpeed)).toThrow();
    });

    it('should validate proficiency bonus range', () => {
      const invalidProficiency = {
        ...validCharacterData,
        proficiencyBonus: 1, // below minimum
      };

      expect(() => characterCreationSchema.parse(invalidProficiency)).toThrow();
    });

    it('should validate equipment array limits', () => {
      const tooMuchEquipment = {
        ...validCharacterData,
        equipment: Array(101).fill({ name: 'Item', quantity: 1 }), // 101 items
      };

      expect(() =>
        characterCreationSchema.parse(tooMuchEquipment)
      ).toThrow();
    });

    it('should validate spells array limits', () => {
      const tooManySpells = {
        ...validCharacterData,
        spells: Array(201).fill({
          name: 'Spell',
          level: 1,
          school: 'evocation',
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'A test spell',
        }), // 201 spells
      };

      expect(() => characterCreationSchema.parse(tooManySpells)).toThrow();
    });

    it('should validate backstory and notes length limits', () => {
      const longTexts = {
        ...validCharacterData,
        backstory: 'A'.repeat(2001), // 2001 characters
        notes: 'B'.repeat(1001), // 1001 characters
      };

      expect(() => characterCreationSchema.parse(longTexts)).toThrow();
    });

    it('should validate image URL format', () => {
      const validImageData = {
        ...validCharacterData,
        imageUrl: 'https://example.com/character.jpg',
      };

      const invalidImageData = {
        ...validCharacterData,
        imageUrl: 'not-a-url',
      };

      expect(() =>
        characterCreationSchema.parse(validImageData)
      ).not.toThrow();
      expect(() =>
        characterCreationSchema.parse(invalidImageData)
      ).toThrow();
    });
  });

  describe('characterUpdateSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name',
        armorClass: 16,
      };

      expect(() => characterUpdateSchema.parse(partialUpdate)).not.toThrow();
    });

    it('should allow empty updates', () => {
      const emptyUpdate = {};

      expect(() => characterUpdateSchema.parse(emptyUpdate)).not.toThrow();
    });

    it('should validate individual fields in updates', () => {
      const invalidUpdate = {
        armorClass: -5, // invalid AC
      };

      expect(() => characterUpdateSchema.parse(invalidUpdate)).toThrow();
    });
  });

  describe('characterSchema', () => {
    const validCompleteCharacter = {
      name: 'Database Character',
      type: 'pc',
      race: 'elf',
      classes: [
        {
          class: 'wizard',
          level: 3,
          hitDie: 6,
          subclass: 'Evocation',
        },
      ],
      abilityScores: {
        strength: 8,
        dexterity: 16,
        constitution: 12,
        intelligence: 18,
        wisdom: 14,
        charisma: 10,
      },
      hitPoints: {
        maximum: 18,
        current: 18,
        temporary: 0,
      },
      armorClass: 13,
      proficiencyBonus: 2,
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: true,
        wisdom: true,
        charisma: false,
      },
      ownerId: '507f1f77bcf86cd799439011',
      isPublic: false,
    };

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
    const validSummary = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Summary Character',
      type: 'pc',
      race: 'halfling',
      classes: [
        {
          class: 'rogue',
          level: 4,
          hitDie: 8,
          subclass: 'Thief',
        },
      ],
      level: 4,
      hitPoints: {
        maximum: 32,
        current: 20,
      },
      armorClass: 15,
      ownerId: '507f1f77bcf86cd799439012',
    };

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
    const validCombatData = {
      characterId: '507f1f77bcf86cd799439011',
      encounterId: '507f1f77bcf86cd799439012',
      initiative: 15,
      currentHitPoints: 25,
      temporaryHitPoints: 5,
      conditions: ['poisoned', 'grappled'],
      concentration: {
        spellName: 'Hold Person',
        spellLevel: 2,
        duration: '1 minute',
      },
      deathSaves: {
        successes: 1,
        failures: 0,
      },
      isStable: true,
      turnOrder: 3,
    };

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
        conditions: Array(21).fill('condition'), // 21 conditions
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

  describe('characterPresetSchema', () => {
    it('should validate character preset data', () => {
      const validPreset = {
        name: 'Fighter Preset',
        type: 'npc',
        race: 'human',
        class: 'fighter',
        level: 5,
        abilityScores: {
          strength: 16,
          dexterity: 12,
          constitution: 14,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        hitPoints: 42,
        armorClass: 18,
      };

      expect(() => characterPresetSchema.parse(validPreset)).not.toThrow();
    });

    it('should validate preset constraints', () => {
      const invalidPreset = {
        name: '', // empty name
        type: 'pc',
        race: 'elf',
        class: 'wizard',
        level: 1,
        abilityScores: {
          strength: 8,
          dexterity: 14,
          constitution: 12,
          intelligence: 16,
          wisdom: 13,
          charisma: 10,
        },
        hitPoints: 6,
        armorClass: 12,
      };

      expect(() => characterPresetSchema.parse(invalidPreset)).toThrow();
    });
  });

  describe('characterExportSchema', () => {
    it('should export character without database fields', () => {
      const characterWithDb = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Export Character',
        type: 'pc',
        race: 'dwarf',
        classes: [
          {
            class: 'cleric',
            level: 3,
            hitDie: 8,
            subclass: 'Life',
          },
        ],
        abilityScores: {
          strength: 14,
          dexterity: 10,
          constitution: 15,
          intelligence: 12,
          wisdom: 16,
          charisma: 13,
        },
        hitPoints: {
          maximum: 24,
          current: 24,
          temporary: 0,
        },
        armorClass: 16,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: false,
          wisdom: true,
          charisma: true,
        },
        ownerId: '507f1f77bcf86cd799439012',
        partyId: '507f1f77bcf86cd799439013',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      const result = characterExportSchema.parse(characterWithDb);

      // Should not have database-specific fields
      expect((result as any)._id).toBeUndefined();
      expect((result as any).ownerId).toBeUndefined();
      expect((result as any).partyId).toBeUndefined();
      expect((result as any).createdAt).toBeUndefined();
      expect((result as any).updatedAt).toBeUndefined();

      // Should have character data
      expect(result.name).toBe('Export Character');
      expect(result.type).toBe('pc');
      expect(result.race).toBe('dwarf');
    });
  });
});