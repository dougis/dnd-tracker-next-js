import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Character, ICharacter, ICharacterDocument } from '../Character';
import { characterCreationSchema, characterUpdateSchema } from '../../validations/character';

describe('Character Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Character.deleteMany({});
  });

  describe('Character Creation', () => {
    it('should create a valid PC character with required fields', async () => {
      const characterData: ICharacter = {
        ownerId: new mongoose.Types.ObjectId(),
        name: 'Gandalf',
        race: 'human',
        type: 'pc',
        classes: [
          {
            class: 'wizard',
            level: 5,
            subclass: 'evocation',
            hitDie: 6
          }
        ],
        abilityScores: {
          strength: 10,
          dexterity: 14,
          constitution: 12,
          intelligence: 18,
          wisdom: 16,
          charisma: 13
        },
        hitPoints: {
          maximum: 28,
          current: 28,
          temporary: 0
        },
        armorClass: 12,
        speed: 30,
        proficiencyBonus: 3
      };

      const character = new Character(characterData);
      const savedCharacter = await character.save();

      expect(savedCharacter._id).toBeDefined();
      expect(savedCharacter.name).toBe('Gandalf');
      expect(savedCharacter.type).toBe('pc');
      expect(savedCharacter.level).toBe(5);
      expect(savedCharacter.classes).toHaveLength(1);
      expect(savedCharacter.classes[0].class).toBe('wizard');
    });

    it('should create a valid NPC character', async () => {
      const npcData: ICharacter = {
        ownerId: new mongoose.Types.ObjectId(),
        name: 'Goblin Warrior',
        race: 'goblin',
        type: 'npc',
        classes: [
          {
            class: 'fighter',
            level: 1,
            hitDie: 10
          }
        ],
        abilityScores: {
          strength: 8,
          dexterity: 14,
          constitution: 10,
          intelligence: 10,
          wisdom: 11,
          charisma: 8
        },
        hitPoints: {
          maximum: 7,
          current: 7,
          temporary: 0
        },
        armorClass: 15,
        speed: 30,
        proficiencyBonus: 2
      };

      const character = new Character(npcData);
      const savedCharacter = await character.save();

      expect(savedCharacter.type).toBe('npc');
      expect(savedCharacter.name).toBe('Goblin Warrior');
      expect(savedCharacter.race).toBe('goblin');
    });

    it('should support multiclass characters', async () => {
      const multiclassData: ICharacter = {
        ownerId: new mongoose.Types.ObjectId(),
        name: 'Paladin Sorcerer',
        race: 'human',
        type: 'pc',
        classes: [
          {
            class: 'paladin',
            level: 3,
            subclass: 'devotion',
            hitDie: 10
          },
          {
            class: 'sorcerer',
            level: 2,
            subclass: 'draconic-bloodline',
            hitDie: 6
          }
        ],
        abilityScores: {
          strength: 16,
          dexterity: 10,
          constitution: 14,
          intelligence: 10,
          wisdom: 12,
          charisma: 16
        },
        hitPoints: {
          maximum: 42,
          current: 42,
          temporary: 0
        },
        armorClass: 18,
        speed: 30,
        proficiencyBonus: 3
      };

      const character = new Character(multiclassData);
      const savedCharacter = await character.save();

      expect(savedCharacter.classes).toHaveLength(2);
      expect(savedCharacter.level).toBe(5); // Total level
      expect(savedCharacter.classes[0].class).toBe('paladin');
      expect(savedCharacter.classes[1].class).toBe('sorcerer');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        name: 'Invalid Character'
      };

      const character = new Character(invalidData);
      
      await expect(character.save()).rejects.toThrow();
    });

    it('should set default values for optional fields', async () => {
      const minimalData: ICharacter = {
        ownerId: new mongoose.Types.ObjectId(),
        name: 'Basic Character',
        race: 'human',
        type: 'pc',
        classes: [
          {
            class: 'fighter',
            level: 1,
            hitDie: 10
          }
        ],
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        hitPoints: {
          maximum: 10,
          current: 10,
          temporary: 0
        },
        armorClass: 10,
        speed: 30,
        proficiencyBonus: 2
      };

      const character = new Character(minimalData);
      const savedCharacter = await character.save();

      expect(savedCharacter.equipment).toEqual([]);
      expect(savedCharacter.spells).toEqual([]);
      expect(savedCharacter.isPublic).toBe(false);
      expect(savedCharacter.backstory).toBe('');
      expect(savedCharacter.notes).toBe('');
    });
  });

  describe('Character Methods', () => {
    let character: ICharacterDocument;

    beforeEach(async () => {
      const characterData: ICharacter = {
        ownerId: new mongoose.Types.ObjectId(),
        name: 'Test Character',
        race: 'elf',
        type: 'pc',
        classes: [
          {
            class: 'ranger',
            level: 4,
            subclass: 'hunter',
            hitDie: 10
          }
        ],
        abilityScores: {
          strength: 12,
          dexterity: 16,
          constitution: 14,
          intelligence: 13,
          wisdom: 15,
          charisma: 10
        },
        hitPoints: {
          maximum: 34,
          current: 25,
          temporary: 5
        },
        armorClass: 15,
        speed: 30,
        proficiencyBonus: 2
      };

      character = new Character(characterData);
      await character.save();
    });

    it('should calculate ability modifiers correctly', () => {
      expect(character.getAbilityModifier('strength')).toBe(1); // 12 -> +1
      expect(character.getAbilityModifier('dexterity')).toBe(3); // 16 -> +3
      expect(character.getAbilityModifier('constitution')).toBe(2); // 14 -> +2
      expect(character.getAbilityModifier('intelligence')).toBe(1); // 13 -> +1
      expect(character.getAbilityModifier('wisdom')).toBe(2); // 15 -> +2
      expect(character.getAbilityModifier('charisma')).toBe(0); // 10 -> +0
    });

    it('should calculate initiative modifier correctly', () => {
      expect(character.getInitiativeModifier()).toBe(3); // Dex modifier
    });

    it('should calculate total level for multiclass characters', () => {
      expect(character.level).toBe(4);
    });

    it('should calculate effective HP including temporary HP', () => {
      expect(character.getEffectiveHP()).toBe(30); // current + temporary
    });

    it('should check if character is alive', () => {
      expect(character.isAlive()).toBe(true);
      
      character.hitPoints.current = 0;
      expect(character.isAlive()).toBe(false);
    });

    it('should check if character is unconscious', () => {
      expect(character.isUnconscious()).toBe(false);
      
      character.hitPoints.current = 0;
      expect(character.isUnconscious()).toBe(true);
    });

    it('should apply damage correctly', () => {
      const damage = 10;
      character.takeDamage(damage);
      
      expect(character.hitPoints.current).toBe(15); // 25 - 10
      expect(character.hitPoints.temporary).toBe(5); // Temp HP unchanged
    });

    it('should apply damage to temporary HP first', () => {
      const damage = 3;
      character.takeDamage(damage);
      
      expect(character.hitPoints.current).toBe(25); // Current unchanged
      expect(character.hitPoints.temporary).toBe(2); // 5 - 3
    });

    it('should heal correctly without exceeding maximum', () => {
      character.heal(5);
      expect(character.hitPoints.current).toBe(30);
      
      character.heal(10); // Should not exceed maximum
      expect(character.hitPoints.current).toBe(34); // Maximum HP
    });

    it('should add temporary HP correctly', () => {
      character.addTemporaryHP(10);
      expect(character.hitPoints.temporary).toBe(10); // Takes higher value
      
      character.addTemporaryHP(3);
      expect(character.hitPoints.temporary).toBe(10); // Doesn't stack, keeps higher
    });
  });

  describe('Character Validation Integration', () => {
    it('should validate character creation data with schema', () => {
      const validData = {
        name: 'Schema Test',
        race: 'dwarf',
        type: 'pc' as const,
        classes: [
          {
            class: 'cleric' as const,
            level: 3,
            subclass: 'life',
            hitDie: 8
          }
        ],
        abilityScores: {
          strength: 14,
          dexterity: 10,
          constitution: 16,
          intelligence: 12,
          wisdom: 16,
          charisma: 13
        },
        hitPoints: {
          maximum: 24,
          current: 24,
          temporary: 0
        },
        armorClass: 16,
        speed: 25,
        proficiencyBonus: 2
      };

      const result = characterCreationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate character update data with schema', () => {
      const updateData = {
        name: 'Updated Name',
        hitPoints: {
          current: 20,
          temporary: 5
        }
      };

      const result = characterUpdateSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('Character Static Methods', () => {
    let ownerId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      ownerId = new mongoose.Types.ObjectId();
      
      // Create test characters
      await Character.create([
        {
          ownerId,
          name: 'Character 1',
          race: 'human',
          type: 'pc',
          classes: [{ class: 'fighter', level: 3, hitDie: 10 }],
          abilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 11 },
          hitPoints: { maximum: 26, current: 26, temporary: 0 },
          armorClass: 16,
          speed: 30,
          proficiencyBonus: 2
        },
        {
          ownerId,
          name: 'Character 2',
          race: 'elf',
          type: 'pc',
          classes: [{ class: 'wizard', level: 2, hitDie: 6 }],
          abilityScores: { strength: 8, dexterity: 16, constitution: 12, intelligence: 18, wisdom: 14, charisma: 10 },
          hitPoints: { maximum: 14, current: 14, temporary: 0 },
          armorClass: 13,
          speed: 30,
          proficiencyBonus: 2
        }
      ]);
    });

    it('should find characters by owner ID', async () => {
      const characters = await Character.findByOwnerId(ownerId);
      expect(characters).toHaveLength(2);
      expect(characters[0].name).toBe('Character 1');
      expect(characters[1].name).toBe('Character 2');
    });

    it('should find characters by type', async () => {
      const pcs = await Character.findByType('pc');
      expect(pcs).toHaveLength(2);
      
      const npcs = await Character.findByType('npc');
      expect(npcs).toHaveLength(0);
    });

    it('should find public characters', async () => {
      await Character.findOneAndUpdate(
        { name: 'Character 1' },
        { isPublic: true }
      );

      const publicCharacters = await Character.findPublic();
      expect(publicCharacters).toHaveLength(1);
      expect(publicCharacters[0].name).toBe('Character 1');
    });
  });

  describe('Character Indexes', () => {
    it('should have required indexes for performance', async () => {
      const indexes = await Character.collection.getIndexes();
      
      // Check that ownerId index exists
      const ownerIdIndex = Object.keys(indexes).find(key => 
        indexes[key].some((field: any) => field[0] === 'ownerId')
      );
      expect(ownerIdIndex).toBeDefined();
      
      // Check that name text index exists
      const nameIndex = Object.keys(indexes).find(key => 
        indexes[key].some((field: any) => field[0] === 'name')
      );
      expect(nameIndex).toBeDefined();
    });
  });
});