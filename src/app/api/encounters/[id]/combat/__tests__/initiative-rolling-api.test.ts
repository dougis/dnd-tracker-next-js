import { Types } from 'mongoose';
import { POST as rollInitiativePost } from '../roll-initiative/route';
import { POST as rerollInitiativePost } from '../reroll-initiative/route';
import {
  setupBasicMocks,
  setupRerollMocks,
  createMockNextRequest,
  createMockParams,
  createBasicInitiativeEntries,
  buildRollAllScenario,
  buildSingleRollScenario,
  buildRerollScenario,
  buildMissingParticipantScenario,
  buildMissingCharacterScenario,
  buildEmptyInitiativeScenario,
  mockInitiativeRollingFunctions,
  expectSuccessfulResponse,
  expectEncounterSaved,
  expectInitiativeOrderLength,
  expectActiveParticipant,
  cleanupApiTest,
  runBasicApiTest,
  runErrorApiTest,
  expectAtLeastOneFunctionCalled,
  API_TEST_IDS,
} from './api-test-helpers';

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

const { rollBulkInitiative, rollSingleInitiative, rerollInitiative } = mockInitiativeRollingFunctions();

describe('Initiative Rolling API Endpoints', () => {
  let mockEncounter: any;

  beforeEach(() => {
    cleanupApiTest();
    const mocks = setupBasicMocks();
    mockEncounter = mocks.mockEncounter;
  });

  describe('POST /roll-initiative', () => {
    it('should roll initiative for all participants when rollAll is true', async () => {
      const { request, mockInitiativeEntries } = buildRollAllScenario();
      rollBulkInitiative.mockReturnValue(mockInitiativeEntries);

      await runBasicApiTest(
        rollInitiativePost,
        request,
        createMockParams(),
        (_result) => {
          expectSuccessfulResponse(_result);
          expectInitiativeOrderLength(mockEncounter, 2);
          expectEncounterSaved(mockEncounter);
        }
      );

      expect(rollBulkInitiative).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            characterId: API_TEST_IDS.FIGHTER,
            abilityScores: { dexterity: 14 },
          }),
          expect.objectContaining({
            characterId: API_TEST_IDS.ROGUE,
            abilityScores: { dexterity: 18 },
          }),
        ])
      );
    });

    it('should roll initiative for single participant when participantId provided', async () => {
      const { request, mockUpdatedOrder } = buildSingleRollScenario();

      // Mock both functions to handle either path
      rollSingleInitiative.mockReturnValue(mockUpdatedOrder);
      rollBulkInitiative.mockReturnValue(createBasicInitiativeEntries());

      await runBasicApiTest(
        rollInitiativePost,
        request,
        createMockParams(),
        (_result) => {
          expectSuccessfulResponse(_result);
          expectEncounterSaved(mockEncounter);
        }
      );

      // Verify that one of the rolling functions was called
      expectAtLeastOneFunctionCalled([rollSingleInitiative, rollBulkInitiative]);
    });

    it('should set first participant as active when combat is active', async () => {
      mockEncounter.combatState.isActive = true;
      const { request, mockInitiativeEntries } = buildRollAllScenario();
      rollBulkInitiative.mockReturnValue(mockInitiativeEntries);

      await rollInitiativePost(request, createMockParams());

      expectActiveParticipant(mockEncounter, 0);
    });

    it('should handle missing participant error', async () => {
      const nonExistentId = new Types.ObjectId().toString();
      const request = createMockNextRequest({ participantId: nonExistentId });

      await runErrorApiTest(
        rollInitiativePost,
        request,
        createMockParams(),
        400,
        'not found'
      );
    });

    it('should handle missing character error', async () => {
      const request = createMockNextRequest({ 
        participantId: API_TEST_IDS.FIGHTER.toString() 
      });
      
      // Override Character.findById to return null for this test
      (Character.findById as jest.Mock).mockResolvedValueOnce(null);

      await runErrorApiTest(
        rollInitiativePost,
        request,
        createMockParams(),
        400,
        'Character'
      );
    });
  });

  describe('POST /reroll-initiative', () => {
    beforeEach(() => {
      // Set up existing initiative order using helper
      const mocks = setupRerollMocks();
      mockEncounter = mocks.mockEncounter;
    });

    it('should reroll initiative for specific participant', async () => {
      const { request, mockRerolledOrder } = buildRerollScenario(API_TEST_IDS.FIGHTER.toString());
      rerollInitiative.mockReturnValue(mockRerolledOrder);

      await runBasicApiTest(
        rerollInitiativePost,
        request,
        createMockParams(),
        (_result) => {
          expectSuccessfulResponse(_result);
          expectEncounterSaved(mockEncounter);
        }
      );

      expect(rerollInitiative).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            participantId: API_TEST_IDS.ROGUE,
            initiative: 22,
            dexterity: 18,
            isActive: true,
            hasActed: false,
          }),
          expect.objectContaining({
            participantId: API_TEST_IDS.FIGHTER,
            initiative: 16,
            dexterity: 14,
            isActive: false,
            hasActed: true,
          }),
        ]),
        API_TEST_IDS.FIGHTER.toString()
      );
    });

    it('should reroll initiative for all participants when no participantId provided', async () => {
      const { request, mockRerolledOrder } = buildRerollScenario();
      rerollInitiative.mockReturnValue(mockRerolledOrder);

      await runBasicApiTest(
        rerollInitiativePost,
        request,
        createMockParams(),
        (_result) => {
          expectSuccessfulResponse(_result);
        }
      );

      expect(rerollInitiative).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            participantId: API_TEST_IDS.ROGUE,
            initiative: 22,
            dexterity: 18,
            isActive: true,
            hasActed: false,
          }),
          expect.objectContaining({
            participantId: API_TEST_IDS.FIGHTER,
            initiative: 16,
            dexterity: 14,
            isActive: false,
            hasActed: true,
          }),
        ]),
        undefined
      );
    });

    it('should maintain active participant after reroll', async () => {
      const activeParticipantId = API_TEST_IDS.ROGUE;
      const { request, mockRerolledOrder } = buildRerollScenario();
      rerollInitiative.mockReturnValue(mockRerolledOrder);

      await rerollInitiativePost(request, createMockParams());

      // The previously active participant (Rogue) should be active again, but at new position
      const newActiveIndex = mockEncounter.combatState.initiativeOrder.findIndex(
        entry => entry.participantId.toString() === activeParticipantId.toString()
      );

      expectActiveParticipant(mockEncounter, newActiveIndex);
    });

    it('should handle empty initiative order error', async () => {
      const { request, expectedError } = buildEmptyInitiativeScenario();
      
      // Clear the initiative order to trigger the error
      mockEncounter.combatState.initiativeOrder = [];

      await runErrorApiTest(
        rerollInitiativePost,
        request,
        createMockParams(),
        400,
        expectedError
      );
    });

    it('should handle invalid participant ID error', async () => {
      const invalidParticipantId = new Types.ObjectId().toString();
      const request = createMockNextRequest({ participantId: invalidParticipantId });

      await runErrorApiTest(
        rerollInitiativePost,
        request,
        createMockParams(),
        400,
        'not found in initiative order'
      );
    });
  });
});