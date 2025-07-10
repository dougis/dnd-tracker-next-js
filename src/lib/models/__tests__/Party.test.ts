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

  describe('Schema Validation', () => {
    it('should create a party with valid data', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const partyData = {
        ownerId: user._id,
        name: 'The Brave Adventurers',
        description: 'A party of brave heroes ready to face any challenge',
        tags: ['heroic', 'balanced'],
        isPublic: false,
        settings: {
          allowJoining: true,
          requireApproval: false,
          maxMembers: 6,
        },
      };

      const party = await Party.create(partyData);

      expect(party.name).toBe('The Brave Adventurers');
      expect(party.description).toBe('A party of brave heroes ready to face any challenge');
      expect(party.tags).toEqual(['heroic', 'balanced']);
      expect(party.isPublic).toBe(false);
      expect(party.settings.allowJoining).toBe(true);
      expect(party.settings.requireApproval).toBe(false);
      expect(party.settings.maxMembers).toBe(6);
      expect(party.memberCount).toBe(0);
      expect(party.playerCharacterCount).toBe(0);
      expect(party.averageLevel).toBe(0);
    });

    it('should require name field', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const partyData = {
        ownerId: user._id,
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

    it('should validate maxMembers minimum value', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const partyData = {
        ownerId: user._id,
        name: 'Invalid Party',
        settings: {
          maxMembers: 0,
        },
      };

      await expect(Party.create(partyData)).rejects.toThrow();
    });

    it('should validate maxMembers maximum value', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const partyData = {
        ownerId: user._id,
        name: 'Too Large Party',
        settings: {
          maxMembers: 101,
        },
      };

      await expect(Party.create(partyData)).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate memberCount correctly', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const party = await Party.create({
        ownerId: user._id,
        name: 'Test Party',
        description: 'Test party for member count',
      });

      // Create characters and add them to party
      const _character1 = await Character.create({
        ownerId: user._id,
        name: 'Fighter',
        type: 'pc',
        race: 'Human',
        classes: [{ class: 'Fighter', level: 5, hitDie: 10 }],
        abilityScores: {
          strength: 16,
          dexterity: 14,
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        hitPoints: { maximum: 38, current: 38, temporary: 0 },
        armorClass: 18,
        speed: 30,
        proficiencyBonus: 3,
        savingThrows: {
          strength: true,
          dexterity: false,
          constitution: true,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        backstory: 'A brave fighter',
        notes: 'Test character',
        partyId: party._id,
      });

      const _character2 = await Character.create({
        ownerId: user._id,
        name: 'Rogue',
        type: 'pc',
        race: 'Halfling',
        classes: [{ class: 'Rogue', level: 5, hitDie: 8 }],
        abilityScores: {
          strength: 8,
          dexterity: 18,
          constitution: 14,
          intelligence: 13,
          wisdom: 12,
          charisma: 10,
        },
        hitPoints: { maximum: 32, current: 32, temporary: 0 },
        armorClass: 15,
        speed: 25,
        proficiencyBonus: 3,
        savingThrows: {
          strength: false,
          dexterity: true,
          constitution: false,
          intelligence: true,
          wisdom: false,
          charisma: false,
        },
        backstory: 'A sneaky rogue',
        notes: 'Test character',
        partyId: party._id,
      });

      // Reload party to trigger virtual calculation
      const updatedParty = await Party.findById(party._id);
      expect(updatedParty?.memberCount).toBe(2);
    });

    it('should calculate playerCharacterCount correctly', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const party = await Party.create({
        ownerId: user._id,
        name: 'Mixed Party',
        description: 'Party with PCs and NPCs',
      });

      // Create PC
      await Character.create({
        ownerId: user._id,
        name: 'Player Character',
        type: 'pc',
        race: 'Elf',
        classes: [{ class: 'Wizard', level: 3, hitDie: 6 }],
        abilityScores: {
          strength: 8,
          dexterity: 14,
          constitution: 13,
          intelligence: 16,
          wisdom: 12,
          charisma: 10,
        },
        hitPoints: { maximum: 18, current: 18, temporary: 0 },
        armorClass: 12,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: true,
          wisdom: true,
          charisma: false,
        },
        backstory: 'A studious wizard',
        notes: 'Test PC',
        partyId: party._id,
      });

      // Create NPC
      await Character.create({
        ownerId: user._id,
        name: 'Guide NPC',
        type: 'npc',
        race: 'Human',
        classes: [{ class: 'Commoner', level: 1, hitDie: 8 }],
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        hitPoints: { maximum: 8, current: 8, temporary: 0 },
        armorClass: 10,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        backstory: 'A helpful guide',
        notes: 'Test NPC',
        partyId: party._id,
      });

      const updatedParty = await Party.findById(party._id);
      expect(updatedParty?.memberCount).toBe(2);
      expect(updatedParty?.playerCharacterCount).toBe(1);
    });

    it('should calculate averageLevel correctly', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const party = await Party.create({
        ownerId: user._id,
        name: 'Level Test Party',
        description: 'Party for testing level calculations',
      });

      // Level 5 character
      await Character.create({
        ownerId: user._id,
        name: 'Level 5 Fighter',
        type: 'pc',
        race: 'Human',
        classes: [{ class: 'Fighter', level: 5, hitDie: 10 }],
        abilityScores: {
          strength: 16,
          dexterity: 14,
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        hitPoints: { maximum: 38, current: 38, temporary: 0 },
        armorClass: 18,
        speed: 30,
        proficiencyBonus: 3,
        savingThrows: {
          strength: true,
          dexterity: false,
          constitution: true,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        backstory: 'Fighter',
        notes: 'Level 5',
        partyId: party._id,
      });

      // Level 3 character
      await Character.create({
        ownerId: user._id,
        name: 'Level 3 Rogue',
        type: 'pc',
        race: 'Halfling',
        classes: [{ class: 'Rogue', level: 3, hitDie: 8 }],
        abilityScores: {
          strength: 8,
          dexterity: 16,
          constitution: 14,
          intelligence: 13,
          wisdom: 12,
          charisma: 10,
        },
        hitPoints: { maximum: 22, current: 22, temporary: 0 },
        armorClass: 15,
        speed: 25,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: true,
          constitution: false,
          intelligence: true,
          wisdom: false,
          charisma: false,
        },
        backstory: 'Rogue',
        notes: 'Level 3',
        partyId: party._id,
      });

      const updatedParty = await Party.findById(party._id);
      expect(updatedParty?.averageLevel).toBe(4); // (5 + 3) / 2 = 4
    });
  });

  describe('Instance Methods', () => {
    it('should add member to party', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const party = await Party.create({
        ownerId: user._id,
        name: 'Test Party',
        description: 'Test party for adding members',
      });

      const character = await Character.create({
        ownerId: user._id,
        name: 'New Member',
        type: 'pc',
        race: 'Dwarf',
        classes: [{ class: 'Cleric', level: 4, hitDie: 8 }],
        abilityScores: {
          strength: 14,
          dexterity: 10,
          constitution: 15,
          intelligence: 12,
          wisdom: 16,
          charisma: 13,
        },
        hitPoints: { maximum: 30, current: 30, temporary: 0 },
        armorClass: 16,
        speed: 25,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: false,
          wisdom: true,
          charisma: true,
        },
        backstory: 'Cleric',
        notes: 'New member',
      });

      await party.addMember(character._id);

      const updatedCharacter = await Character.findById(character._id);
      expect(updatedCharacter?.partyId?.toString()).toBe(party._id.toString());
    });

    it('should remove member from party', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const party = await Party.create({
        ownerId: user._id,
        name: 'Test Party',
        description: 'Test party for removing members',
      });

      const character = await Character.create({
        ownerId: user._id,
        name: 'Leaving Member',
        type: 'pc',
        race: 'Elf',
        classes: [{ class: 'Ranger', level: 2, hitDie: 10 }],
        abilityScores: {
          strength: 13,
          dexterity: 16,
          constitution: 14,
          intelligence: 12,
          wisdom: 15,
          charisma: 10,
        },
        hitPoints: { maximum: 22, current: 22, temporary: 0 },
        armorClass: 14,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {
          strength: true,
          dexterity: true,
          constitution: false,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        backstory: 'Ranger',
        notes: 'Leaving member',
        partyId: party._id,
      });

      await party.removeMember(character._id);

      const updatedCharacter = await Character.findById(character._id);
      expect(updatedCharacter?.partyId).toBeUndefined();
    });

    it('should get all members', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      const party = await Party.create({
        ownerId: user._id,
        name: 'Test Party',
        description: 'Test party for getting members',
      });

      await Character.create({
        ownerId: user._id,
        name: 'Member 1',
        type: 'pc',
        race: 'Human',
        classes: [{ class: 'Fighter', level: 1, hitDie: 10 }],
        abilityScores: {
          strength: 16,
          dexterity: 14,
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        hitPoints: { maximum: 15, current: 15, temporary: 0 },
        armorClass: 16,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {
          strength: true,
          dexterity: false,
          constitution: true,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        backstory: 'Member 1',
        notes: 'First member',
        partyId: party._id,
      });

      await Character.create({
        ownerId: user._id,
        name: 'Member 2',
        type: 'pc',
        race: 'Elf',
        classes: [{ class: 'Wizard', level: 1, hitDie: 6 }],
        abilityScores: {
          strength: 8,
          dexterity: 14,
          constitution: 13,
          intelligence: 16,
          wisdom: 12,
          charisma: 10,
        },
        hitPoints: { maximum: 9, current: 9, temporary: 0 },
        armorClass: 12,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: true,
          wisdom: true,
          charisma: false,
        },
        backstory: 'Member 2',
        notes: 'Second member',
        partyId: party._id,
      });

      const members = await party.getMembers();
      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('Member 1');
      expect(members[1].name).toBe('Member 2');
    });
  });

  describe('Static Methods', () => {
    it('should find parties by owner ID', async () => {
      const user1 = await User.create({
        email: 'dm1@example.com',
        password: 'password123',
        name: 'DM 1',
        isEmailVerified: true,
      });

      const user2 = await User.create({
        email: 'dm2@example.com',
        password: 'password123',
        name: 'DM 2',
        isEmailVerified: true,
      });

      await Party.create({
        ownerId: user1._id,
        name: 'User 1 Party 1',
        description: 'First party for user 1',
      });

      await Party.create({
        ownerId: user1._id,
        name: 'User 1 Party 2',
        description: 'Second party for user 1',
      });

      await Party.create({
        ownerId: user2._id,
        name: 'User 2 Party',
        description: 'Party for user 2',
      });

      const user1Parties = await Party.findByOwnerId(user1._id);
      expect(user1Parties).toHaveLength(2);
      expect(user1Parties[0].name).toBe('User 1 Party 1');
      expect(user1Parties[1].name).toBe('User 1 Party 2');
    });

    it('should find public parties', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      await Party.create({
        ownerId: user._id,
        name: 'Private Party',
        description: 'This party is private',
        isPublic: false,
      });

      await Party.create({
        ownerId: user._id,
        name: 'Public Party',
        description: 'This party is public',
        isPublic: true,
      });

      const publicParties = await Party.findPublic();
      expect(publicParties).toHaveLength(1);
      expect(publicParties[0].name).toBe('Public Party');
    });

    it('should search parties by name', async () => {
      const user = await User.create({
        email: 'dm@example.com',
        password: 'password123',
        name: 'Dungeon Master',
        isEmailVerified: true,
      });

      await Party.create({
        ownerId: user._id,
        name: 'The Dragon Slayers',
        description: 'Brave heroes who slay dragons',
      });

      await Party.create({
        ownerId: user._id,
        name: 'The Shadow Walkers',
        description: 'Stealthy adventurers',
      });

      const searchResults = await Party.searchByName('Dragon');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('The Dragon Slayers');
    });
  });
});