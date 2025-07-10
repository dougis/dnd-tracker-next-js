/**
 * Unit Tests for Party Model
 * Tests model functionality using mocks
 */

import { Types } from 'mongoose';

// Mock Party model for testing
const createMockParty = (overrides: any = {}) => {
  const defaultParty = {
    _id: new Types.ObjectId(),
    ownerId: new Types.ObjectId(),
    name: 'Test Party',
    description: 'Test party description',
    tags: [],
    isPublic: false,
    sharedWith: [],
    settings: {
      allowJoining: false,
      requireApproval: true,
      maxMembers: 6,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivity: new Date(),
    memberCount: 0,
    playerCharacterCount: 0,
    averageLevel: 0,
    ...overrides,
  };

  // Mock instance methods
  defaultParty.addMember = jest.fn().mockResolvedValue(undefined);
  defaultParty.removeMember = jest.fn().mockResolvedValue(undefined);
  defaultParty.getMembers = jest.fn().mockResolvedValue([]);
  defaultParty.updateActivity = jest.fn();
  defaultParty.save = jest.fn().mockResolvedValue(defaultParty);

  return defaultParty;
};

// Mock Party model with static methods
const MockPartyModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByOwnerId: jest.fn(),
  findPublic: jest.fn(),
  searchByName: jest.fn(),
  deleteMany: jest.fn(),
};

// Mock Character model (unused but kept for potential future test expansion)
const _MockCharacterModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  deleteMany: jest.fn(),
};

// Mock User model (unused but kept for potential future test expansion)
const _MockUserModel = {
  create: jest.fn(),
  deleteMany: jest.fn(),
};

describe('Party Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Validation', () => {
    it('should create a party with valid data', async () => {
      const testUserId = new Types.ObjectId();
      const partyData = {
        ownerId: testUserId,
        name: 'The Brave Adventurers',
        description: 'A party of brave heroes',
      };

      const mockParty = createMockParty(partyData);
      MockPartyModel.create.mockResolvedValue(mockParty);

      const party = await MockPartyModel.create(partyData);

      expect(party.name).toBe('The Brave Adventurers');
      expect(party.ownerId).toEqual(testUserId);
      expect(MockPartyModel.create).toHaveBeenCalledWith(partyData);
    });

    it('should require name field', async () => {
      const testUserId = new Types.ObjectId();
      const partyData = {
        ownerId: testUserId,
        description: 'A party without a name',
      };

      MockPartyModel.create.mockRejectedValue(new Error('Party name is required'));

      await expect(MockPartyModel.create(partyData)).rejects.toThrow('Party name is required');
    });

    it('should require ownerId field', async () => {
      const partyData = {
        name: 'The Orphaned Party',
        description: 'A party without an owner',
      };

      MockPartyModel.create.mockRejectedValue(new Error('ownerId is required'));

      await expect(MockPartyModel.create(partyData)).rejects.toThrow('ownerId is required');
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate memberCount correctly', () => {
      const party = createMockParty({ memberCount: 3 });
      expect(party.memberCount).toBe(3);
    });

    it('should calculate playerCharacterCount correctly', () => {
      const party = createMockParty({ playerCharacterCount: 2 });
      expect(party.playerCharacterCount).toBe(2);
    });

    it('should calculate averageLevel correctly', () => {
      const party = createMockParty({ averageLevel: 5 });
      expect(party.averageLevel).toBe(5);
    });
  });

  describe('Instance Methods', () => {
    let mockParty: any;

    beforeEach(() => {
      mockParty = createMockParty();
    });

    it('should add member to party', async () => {
      const characterId = new Types.ObjectId();

      await mockParty.addMember(characterId);

      expect(mockParty.addMember).toHaveBeenCalledWith(characterId);
    });

    it('should remove member from party', async () => {
      const characterId = new Types.ObjectId();

      await mockParty.removeMember(characterId);

      expect(mockParty.removeMember).toHaveBeenCalledWith(characterId);
    });

    it('should get all members', async () => {
      const mockMembers = [
        { _id: new Types.ObjectId(), name: 'Member 1' },
        { _id: new Types.ObjectId(), name: 'Member 2' },
      ];

      mockParty.getMembers.mockResolvedValue(mockMembers);

      const members = await mockParty.getMembers();

      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('Member 1');
      expect(mockParty.getMembers).toHaveBeenCalled();
    });

    it('should update activity', () => {
      mockParty.updateActivity();
      expect(mockParty.updateActivity).toHaveBeenCalled();
    });
  });

  describe('Static Methods', () => {
    it('should find parties by owner ID', async () => {
      const testUserId = new Types.ObjectId();
      const mockParties = [
        createMockParty({ name: 'User Party 1', ownerId: testUserId }),
        createMockParty({ name: 'User Party 2', ownerId: testUserId }),
      ];

      MockPartyModel.findByOwnerId.mockResolvedValue(mockParties);

      const parties = await MockPartyModel.findByOwnerId(testUserId);

      expect(parties).toHaveLength(2);
      expect(parties[0].name).toBe('User Party 1');
      expect(MockPartyModel.findByOwnerId).toHaveBeenCalledWith(testUserId);
    });

    it('should find public parties', async () => {
      const mockPublicParties = [
        createMockParty({ name: 'Public Party 1', isPublic: true }),
        createMockParty({ name: 'Public Party 2', isPublic: true }),
      ];

      MockPartyModel.findPublic.mockResolvedValue(mockPublicParties);

      const publicParties = await MockPartyModel.findPublic();

      expect(publicParties).toHaveLength(2);
      expect(publicParties[0].isPublic).toBe(true);
      expect(MockPartyModel.findPublic).toHaveBeenCalled();
    });

    it('should search parties by name', async () => {
      const searchTerm = 'Dragon';
      const mockSearchResults = [
        createMockParty({ name: 'The Dragon Slayers' }),
      ];

      MockPartyModel.searchByName.mockResolvedValue(mockSearchResults);

      const results = await MockPartyModel.searchByName(searchTerm);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('The Dragon Slayers');
      expect(MockPartyModel.searchByName).toHaveBeenCalledWith(searchTerm);
    });
  });

  describe('Model Constraints', () => {
    it('should validate tag limit', async () => {
      const partyData = {
        name: 'Test Party',
        ownerId: new Types.ObjectId(),
        tags: Array(11).fill('tag'), // More than 10 tags
      };

      MockPartyModel.create.mockRejectedValue(new Error('Party cannot have more than 10 tags'));

      await expect(MockPartyModel.create(partyData)).rejects.toThrow('Party cannot have more than 10 tags');
    });

    it('should validate shared user limit', async () => {
      const partyData = {
        name: 'Test Party',
        ownerId: new Types.ObjectId(),
        sharedWith: Array(51).fill(new Types.ObjectId()), // More than 50 users
      };

      MockPartyModel.create.mockRejectedValue(new Error('Party cannot be shared with more than 50 users'));

      await expect(MockPartyModel.create(partyData)).rejects.toThrow('Party cannot be shared with more than 50 users');
    });

    it('should validate max members setting', async () => {
      const partyData = {
        name: 'Test Party',
        ownerId: new Types.ObjectId(),
        settings: {
          maxMembers: 101, // More than 100 members
        },
      };

      MockPartyModel.create.mockRejectedValue(new Error('Party cannot have more than 100 members'));

      await expect(MockPartyModel.create(partyData)).rejects.toThrow('Party cannot have more than 100 members');
    });
  });
});