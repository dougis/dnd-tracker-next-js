import mongoose from 'mongoose';
import { Party } from '../Party';
import { Character } from '../Character';
import User from '../User';

describe('Party Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI!);
  });

  beforeEach(async () => {
    await Party.deleteMany({});
    await Character.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test data factory functions
  const createTestUser = (overrides: any = {}) => {
    return User.create({
      email: 'dm@example.com',
      password: 'password123',
      name: 'Dungeon Master',
      isEmailVerified: true,
      ...overrides,
    });
  };

  const createTestParty = (ownerId: any, overrides: any = {}) => {
    return Party.create({
      ownerId,
      name: 'Test Party',
      description: 'Test party',
      ...overrides,
    });
  };

  const createTestCharacter = (ownerId: any, overrides: any = {}) => {
    return Character.create({
      ownerId,
      name: 'Test Character',
      type: 'pc',
      race: 'Human',
      classes: [{ class: 'Fighter', level: 5, hitDie: 10 }],
      abilityScores: { 
        strength: 16, 
        dexterity: 14, 
        constitution: 15, 
        intelligence: 10, 
        wisdom: 12, 
        charisma: 8 
      },
      ...overrides,
    });
  };

  describe('Schema Validation', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should create a party with valid data', async () => {
      const party = await createTestParty(testUser._id, {
        name: 'The Brave Adventurers',
        description: 'A party of brave heroes',
      });

      expect(party.name).toBe('The Brave Adventurers');
      expect(party.ownerId).toEqual(testUser._id);
    });

    it('should require name field', async () => {
      const partyData = {
        ownerId: testUser._id,
        description: 'A party without a name',
      };

      await expect(Party.create(partyData)).rejects.toThrow();
    });

    it('should require ownerId field', async () => {
      const partyData = {
        name: 'The Orphaned Party',
        description: 'A party without an owner',
      };

      await expect(Party.create(partyData)).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    let testUser: any;
    let testParty: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testParty = await createTestParty(testUser._id);
    });

    it('should calculate memberCount correctly', async () => {
      await createTestCharacter(testUser._id, {
        name: 'Fighter',
        partyId: testParty._id,
      });

      const updatedParty = await Party.findById(testParty._id);
      expect(updatedParty?.memberCount).toBe(1);
    });

    it('should calculate playerCharacterCount correctly', async () => {
      await createTestCharacter(testUser._id, {
        name: 'PC',
        type: 'pc',
        partyId: testParty._id,
      });

      await createTestCharacter(testUser._id, {
        name: 'NPC',
        type: 'npc',
        classes: [{ class: 'Commoner', level: 1, hitDie: 8 }],
        abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        partyId: testParty._id,
      });

      const updatedParty = await Party.findById(testParty._id);
      expect(updatedParty?.playerCharacterCount).toBe(1);
    });

    it('should calculate averageLevel correctly', async () => {
      await createTestCharacter(testUser._id, {
        name: 'Character1',
        classes: [{ class: 'Fighter', level: 5, hitDie: 10 }],
        partyId: testParty._id,
      });

      await createTestCharacter(testUser._id, {
        name: 'Character2',
        race: 'Elf',
        classes: [{ class: 'Rogue', level: 3, hitDie: 8 }],
        abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 13, wisdom: 12, charisma: 10 },
        partyId: testParty._id,
      });

      const updatedParty = await Party.findById(testParty._id);
      expect(updatedParty?.averageLevel).toBe(4);
    });
  });

  describe('Instance Methods', () => {
    let testUser: any;
    let testParty: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testParty = await createTestParty(testUser._id);
    });

    it('should add member to party', async () => {
      const character = await createTestCharacter(testUser._id, {
        name: 'New Member',
        race: 'Dwarf',
        classes: [{ class: 'Cleric', level: 4, hitDie: 8 }],
        abilityScores: { strength: 14, dexterity: 10, constitution: 15, intelligence: 12, wisdom: 16, charisma: 13 },
      });

      await testParty.addMember(character._id);

      const updatedCharacter = await Character.findById(character._id);
      expect(updatedCharacter?.partyId?.toString()).toBe(testParty._id.toString());
    });

    it('should remove member from party', async () => {
      const character = await createTestCharacter(testUser._id, {
        name: 'Leaving Member',
        race: 'Elf',
        classes: [{ class: 'Ranger', level: 2, hitDie: 10 }],
        abilityScores: { strength: 13, dexterity: 16, constitution: 14, intelligence: 12, wisdom: 15, charisma: 10 },
        partyId: testParty._id,
      });

      await testParty.removeMember(character._id);

      const updatedCharacter = await Character.findById(character._id);
      expect(updatedCharacter?.partyId).toBeUndefined();
    });

    it('should get all members', async () => {
      await createTestCharacter(testUser._id, {
        name: 'Member 1',
        partyId: testParty._id,
      });

      const members = await testParty.getMembers();
      expect(members).toHaveLength(1);
      expect(members[0].name).toBe('Member 1');
    });
  });

  describe('Static Methods', () => {
    let testUser1: any;
    let testUser2: any;

    beforeEach(async () => {
      testUser1 = await createTestUser({
        email: 'dm1@example.com',
        name: 'DM 1',
      });

      testUser2 = await createTestUser({
        email: 'dm2@example.com',
        name: 'DM 2',
      });
    });

    it('should find parties by owner ID', async () => {
      await createTestParty(testUser1._id, {
        name: 'User 1 Party',
        description: 'Party for user 1',
      });

      await createTestParty(testUser2._id, {
        name: 'User 2 Party',
        description: 'Party for user 2',
      });

      const user1Parties = await Party.findByOwnerId(testUser1._id);
      expect(user1Parties).toHaveLength(1);
      expect(user1Parties[0].name).toBe('User 1 Party');
    });

    it('should find public parties', async () => {
      await createTestParty(testUser1._id, {
        name: 'Private Party',
        description: 'This party is private',
        isPublic: false,
      });

      await createTestParty(testUser1._id, {
        name: 'Public Party',
        description: 'This party is public',
        isPublic: true,
      });

      const publicParties = await Party.findPublic();
      expect(publicParties).toHaveLength(1);
      expect(publicParties[0].name).toBe('Public Party');
    });

    it('should search parties by name', async () => {
      await createTestParty(testUser1._id, {
        name: 'The Dragon Slayers',
        description: 'Brave heroes who slay dragons',
      });

      await createTestParty(testUser1._id, {
        name: 'The Shadow Walkers',
        description: 'Stealthy adventurers',
      });

      const results = await Party.searchByName('Dragon');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('The Dragon Slayers');
    });
  });
});