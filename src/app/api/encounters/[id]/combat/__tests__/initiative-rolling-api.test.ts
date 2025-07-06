import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { POST as rollInitiativePost } from '../roll-initiative/route';
import { POST as rerollInitiativePost } from '../reroll-initiative/route';
import { Character } from '@/lib/models/Character';
import { EncounterService } from '@/lib/services/EncounterService';

// Mock the dependencies
jest.mock('@/lib/models/Character', () => ({
  Character: {
    find: jest.fn(),
    findById: jest.fn(),
  }
}));

jest.mock('@/lib/services/EncounterService', () => ({
  EncounterService: {
    getEncounterById: jest.fn(),
  }
}));

jest.mock('@/lib/models/encounter/initiative-rolling', () => ({
  rollBulkInitiative: jest.fn(),
  rollSingleInitiative: jest.fn(),
  rerollInitiative: jest.fn(),
}));

const { rollBulkInitiative, rollSingleInitiative, rerollInitiative } = jest.requireMock('@/lib/models/encounter/initiative-rolling');

describe('Initiative Rolling API Endpoints', () => {
  let mockEncounter: any;
  let mockCharacters: any[];
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock characters with ability scores
    mockCharacters = [
      {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Fighter',
        abilityScores: { dexterity: 14 },
      },
      {
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Rogue',
        abilityScores: { dexterity: 18 },
      },
    ];

    // Mock encounter
    mockEncounter = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439000'),
      participants: [
        {
          characterId: mockCharacters[0]._id,
          name: 'Fighter',
          type: 'pc',
        },
        {
          characterId: mockCharacters[1]._id,
          name: 'Rogue',
          type: 'pc',
        },
      ],
      combatState: {
        isActive: true, // Set to true for the wrapper validation
        currentRound: 1,
        currentTurn: 0,
        initiativeOrder: [],
      },
      save: jest.fn().mockResolvedValue(true),
    };

    // Mock EncounterService.getEncounterById
    (EncounterService.getEncounterById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockEncounter,
    });

    // Mock Character.find and findById
    (Character.find as jest.Mock).mockResolvedValue(mockCharacters);
    (Character.findById as jest.Mock).mockImplementation((id) => {
      return Promise.resolve(mockCharacters.find(c => c._id.toString() === id.toString()));
    });
  });

  describe('POST /roll-initiative', () => {
    it('should roll initiative for all participants when rollAll is true', async () => {
      const mockInitiativeEntries = [
        {
          participantId: mockCharacters[1]._id,
          initiative: 22,
          dexterity: 18,
          isActive: false,
          hasActed: false,
          name: 'Rogue',
          type: 'pc',
        },
        {
          participantId: mockCharacters[0]._id,
          initiative: 16,
          dexterity: 14,
          isActive: false,
          hasActed: false,
          name: 'Fighter',
          type: 'pc',
        },
      ];

      rollBulkInitiative.mockReturnValue(mockInitiativeEntries);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ rollAll: true }),
      });

      const response = await rollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      const result = await response.json();

      expect(rollBulkInitiative).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            characterId: mockCharacters[0]._id,
            abilityScores: { dexterity: 14 },
          }),
          expect.objectContaining({
            characterId: mockCharacters[1]._id,
            abilityScores: { dexterity: 18 },
          }),
        ])
      );

      expect(mockEncounter.combatState.initiativeOrder).toHaveLength(2);
      expect(mockEncounter.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.encounter).toBeDefined();
    });

    it('should roll initiative for single participant when participantId provided', async () => {
      const participantId = mockCharacters[0]._id.toString();
      const mockUpdatedOrder = [
        {
          participantId: mockCharacters[0]._id,
          initiative: 16,
          dexterity: 14,
          isActive: false,
          hasActed: false,
        },
      ];

      rollSingleInitiative.mockReturnValue(mockUpdatedOrder);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      });

      const response = await rollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      const result = await response.json();

      expect(rollSingleInitiative).toHaveBeenCalledWith(
        mockEncounter.combatState.initiativeOrder,
        participantId,
        14
      );

      expect(mockEncounter.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.encounter).toBeDefined();
    });

    it('should set first participant as active when combat is active', async () => {
      mockEncounter.combatState.isActive = true;

      const mockInitiativeEntries = [
        {
          participantId: mockCharacters[1]._id,
          initiative: 22,
          dexterity: 18,
          isActive: false,
          hasActed: false,
          name: 'Rogue',
          type: 'pc',
        },
      ];

      rollBulkInitiative.mockReturnValue(mockInitiativeEntries);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ rollAll: true }),
      });

      await rollInitiativePost(mockRequest, {
        params: { id: mockEncounter._id.toString() }
      });

      expect(mockEncounter.combatState.initiativeOrder[0].isActive).toBe(true);
      expect(mockEncounter.combatState.currentTurn).toBe(0);
    });

    it('should handle missing participant error', async () => {
      const invalidParticipantId = new Types.ObjectId().toString();

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ participantId: invalidParticipantId }),
      });

      const response = await rollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle missing character error', async () => {
      const participantId = mockCharacters[0]._id.toString();

      (Character.findById as jest.Mock).mockResolvedValue(null);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      });

      const response = await rollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Character');
    });
  });

  describe('POST /reroll-initiative', () => {
    beforeEach(() => {
      // Set up existing initiative order
      mockEncounter.combatState.initiativeOrder = [
        {
          participantId: mockCharacters[1]._id,
          initiative: 22,
          dexterity: 18,
          isActive: true,
          hasActed: false,
        },
        {
          participantId: mockCharacters[0]._id,
          initiative: 16,
          dexterity: 14,
          isActive: false,
          hasActed: true,
        },
      ];
      mockEncounter.combatState.isActive = true;
      mockEncounter.combatState.currentTurn = 0;
    });

    it('should reroll initiative for specific participant', async () => {
      const participantId = mockCharacters[0]._id.toString();
      const mockRerolledOrder = [
        {
          participantId: mockCharacters[0]._id,
          initiative: 20,
          dexterity: 14,
          isActive: false,
          hasActed: true,
        },
        {
          participantId: mockCharacters[1]._id,
          initiative: 18,
          dexterity: 18,
          isActive: false,
          hasActed: false,
        },
      ];

      rerollInitiative.mockReturnValue(mockRerolledOrder);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      });

      const response = await rerollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      const result = await response.json();

      expect(rerollInitiative).toHaveBeenCalledWith(
        mockEncounter.combatState.initiativeOrder,
        participantId
      );

      expect(mockEncounter.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.encounter).toBeDefined();
    });

    it('should reroll initiative for all participants when no participantId provided', async () => {
      const mockRerolledOrder = [
        {
          participantId: mockCharacters[0]._id,
          initiative: 25,
          dexterity: 14,
          isActive: false,
          hasActed: true,
        },
        {
          participantId: mockCharacters[1]._id,
          initiative: 15,
          dexterity: 18,
          isActive: false,
          hasActed: false,
        },
      ];

      rerollInitiative.mockReturnValue(mockRerolledOrder);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await rerollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      const result = await response.json();

      expect(rerollInitiative).toHaveBeenCalledWith(
        mockEncounter.combatState.initiativeOrder,
        undefined
      );

      expect(result.success).toBe(true);
      expect(result.encounter).toBeDefined();
    });

    it('should maintain active participant after reroll', async () => {
      const activeParticipantId = mockCharacters[1]._id;

      const mockRerolledOrder = [
        {
          participantId: mockCharacters[0]._id,
          initiative: 25,
          dexterity: 14,
          isActive: false,
          hasActed: true,
        },
        {
          participantId: activeParticipantId,
          initiative: 15,
          dexterity: 18,
          isActive: false,
          hasActed: false,
        },
      ];

      rerollInitiative.mockReturnValue(mockRerolledOrder);

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await rerollInitiativePost(mockRequest, {
        params: { id: mockEncounter._id.toString() }
      });

      // The previously active participant (Rogue) should be active again, but at new position
      const newActiveIndex = mockEncounter.combatState.initiativeOrder.findIndex(
        entry => entry.participantId.toString() === activeParticipantId.toString()
      );

      expect(mockEncounter.combatState.initiativeOrder[newActiveIndex].isActive).toBe(true);
      expect(mockEncounter.combatState.currentTurn).toBe(newActiveIndex);
    });

    it('should handle empty initiative order error', async () => {
      mockEncounter.combatState.initiativeOrder = [];

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await rerollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain('No initiative order found');
    });

    it('should handle invalid participant ID error', async () => {
      const invalidParticipantId = new Types.ObjectId().toString();

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ participantId: invalidParticipantId }),
      });

      const response = await rerollInitiativePost(mockRequest, {
        params: Promise.resolve({ id: mockEncounter._id.toString() })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found in initiative order');
    });
  });
});