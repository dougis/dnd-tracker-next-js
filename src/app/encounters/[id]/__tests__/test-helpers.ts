import { Types } from 'mongoose';
import type { Encounter, ParticipantReference } from '@/lib/validations/encounter';

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { EncounterDetailClient } from '../EncounterDetailClient';

/**
 * Test helper functions for encounter detail page tests
 */

let participantCounter = 0;

export const createTestParticipant = (overrides: Partial<ParticipantReference> = {}): ParticipantReference => ({
  characterId: new Types.ObjectId().toString() + (++participantCounter),
  name: 'Test Participant',
  type: 'pc' as const,
  maxHitPoints: 30,
  currentHitPoints: 30,
  temporaryHitPoints: 0,
  armorClass: 15,
  initiative: undefined,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
  position: undefined,
  ...overrides,
});

export const createTestEncounter = (overrides: Partial<Encounter> = {}): Encounter => ({
  _id: new Types.ObjectId().toString(),
  ownerId: new Types.ObjectId().toString(),
  name: 'Test Encounter',
  description: 'A test encounter for testing purposes',
  tags: [],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 1,
  participants: [],
  settings: {
    allowPlayerVisibility: true,
    autoRollInitiative: false,
    trackResources: true,
    enableLairActions: false,
    lairActionInitiative: undefined,
    enableGridMovement: false,
    gridSize: 5,
    roundTimeLimit: undefined,
    experienceThreshold: undefined,
  },
  combatState: {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    startedAt: undefined,
    pausedAt: undefined,
    endedAt: undefined,
    totalDuration: 0,
  },
  status: 'draft',
  partyId: undefined,
  isPublic: false,
  sharedWith: [],
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Helper to create an encounter ready for combat
 */
export const createReadyEncounter = (): Encounter => {
  const participants = [
    createTestParticipant({
      name: 'Ready Player',
      initiative: 18,
      isPlayer: true,
    }),
    createTestParticipant({
      name: 'Ready Enemy',
      type: 'npc',
      initiative: 12,
      isPlayer: false,
    }),
  ];

  return createTestEncounter({
    participants,
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: true,
      trackResources: true,
      enableLairActions: false,
      lairActionInitiative: undefined,
      enableGridMovement: false,
      gridSize: 5,
      roundTimeLimit: undefined,
      experienceThreshold: undefined,
    },
  });
};

/**
 * Helper to create an encounter with lair actions
 */
export const createLairActionEncounter = (): Encounter => {
  return createTestEncounter({
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: true,
      lairActionInitiative: 20,
      enableGridMovement: false,
      gridSize: 5,
      roundTimeLimit: undefined,
      experienceThreshold: undefined,
    },
  });
};

/**
 * Helper to create an encounter with grid movement
 */
export const createGridEncounter = (): Encounter => {
  return createTestEncounter({
    participants: [
      createTestParticipant({
        name: 'Grid Player',
        position: { x: 5, y: 5 },
      }),
    ],
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: false,
      lairActionInitiative: undefined,
      enableGridMovement: true,
      gridSize: 5,
      roundTimeLimit: undefined,
      experienceThreshold: undefined,
    },
  });
};

/**
 * Helper to create an active combat encounter
 */
export const createActiveCombatEncounter = (): Encounter => {
  const participants = [
    createTestParticipant({
      name: 'Active Player',
      initiative: 16,
    }),
    createTestParticipant({
      name: 'Active Enemy',
      type: 'npc',
      initiative: 14,
    }),
  ];

  return createTestEncounter({
    participants,
    combatState: {
      isActive: true,
      currentRound: 1,
      currentTurn: 0,
      initiativeOrder: [
        {
          participantId: participants[0].characterId,
          initiative: 16,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        },
        {
          participantId: participants[1].characterId,
          initiative: 14,
          dexterity: 12,
          isActive: false,
          hasActed: false,
        },
      ],
      startedAt: new Date().toISOString(),
      pausedAt: undefined,
      endedAt: undefined,
      totalDuration: 300, // 5 minutes
    },
    status: 'active',
  });
};

/**
 * Helper to create an encounter with injured participants
 */
export const createInjuredParticipantsEncounter = (): Encounter => {
  const participants = [
    createTestParticipant({
      name: 'Injured Hero',
      maxHitPoints: 45,
      currentHitPoints: 20,
      conditions: ['poisoned', 'exhausted'],
    }),
    createTestParticipant({
      name: 'Bloodied Enemy',
      type: 'npc',
      maxHitPoints: 30,
      currentHitPoints: 5,
      conditions: ['frightened'],
    }),
  ];

  return createTestEncounter({
    participants,
  });
};

/**
 * Helper to create encounter with various participant types
 */
export const createMixedParticipantsEncounter = (): Encounter => {
  const participants = [
    createTestParticipant({
      name: 'Player Character',
      type: 'pc',
      isPlayer: true,
    }),
    createTestParticipant({
      name: 'Friendly NPC',
      type: 'npc',
      isPlayer: false,
      notes: 'Ally to the party',
    }),
    createTestParticipant({
      name: 'Monster',
      type: 'monster',
      isPlayer: false,
      maxHitPoints: 58,
      armorClass: 17,
    }),
  ];

  return createTestEncounter({
    participants,
  });
};

/**
 * Mock data for various encounter states
 */
export const mockEncounterStates = {
  draft: () => createTestEncounter({ status: 'draft' }),
  active: () => createActiveCombatEncounter(),
  completed: () => createTestEncounter({
    status: 'completed',
    combatState: {
      isActive: false,
      currentRound: 5,
      currentTurn: 0,
      initiativeOrder: [],
      startedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      pausedAt: undefined,
      endedAt: new Date().toISOString(),
      totalDuration: 1800, // 30 minutes
    },
  }),
  archived: () => createTestEncounter({ status: 'archived' }),
};

/**
 * Test utility functions
 */
export const getParticipantById = (encounter: Encounter, participantId: string): ParticipantReference | undefined => {
  return encounter.participants.find(p => p.characterId === participantId);
};

export const isEncounterReady = (encounter: Encounter): boolean => {
  return encounter.participants.length > 0 &&
         encounter.participants.every(p => p.initiative !== undefined);
};

export const calculateEncounterCR = (encounter: Encounter): number => {
  // Simplified CR calculation for testing
  const totalHP = encounter.participants
    .filter(p => !p.isPlayer)
    .reduce((sum, p) => sum + p.maxHitPoints, 0);

  return Math.max(1, Math.floor(totalHP / 10));
};

/**
 * Mock API responses
 */
export const mockApiResponses = {
  success: (data: any) => ({ success: true, data }),
  error: (message: string) => ({ success: false, error: message }),
  notFound: () => ({ success: false, error: 'Encounter not found' }),
  networkError: () => ({ success: false, error: 'Network connection failed' }),
  validationError: (field: string) => ({
    success: false,
    error: `Validation failed for field: ${field}`
  }),
};

/**
 * Common test patterns to reduce duplication
 */
export const testPatterns = {
  waitForElement: async (getElement: () => HTMLElement | null, timeout = 1000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = getElement();
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('Element not found within timeout');
  },

  expectElementToExist: (getText: () => HTMLElement) => {
    return expect(getText()).toBeInTheDocument();
  },

  getByTextWithTimeout: async (screen: any, text: string) => {
    return testPatterns.waitForElement(() => screen.queryByText(text));
  },
};

/**
 * Test render helpers to reduce duplication
 */
export const renderHelpers = {
  renderEncounterDetail: (encounterId = 'test-id') => {
    return render(React.createElement(EncounterDetailClient, { encounterId }));
  },

  waitForEncounterLoad: async (screen: any) => {
    await waitFor(() => {
      expect(screen.getByText('Goblin Ambush')).toBeInTheDocument();
    });
  },

  expectTextPresent: async (screen: any, text: string) => {
    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  },

  expectMultipleTextsPresent: async (screen: any, texts: string[]) => {
    await waitFor(() => {
      texts.forEach(text => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });
  },
};

/**
 * Mock setup helpers
 */
export const mockHelpers = {
  setupSuccessfulEncounterMock: (mockService: any, encounter = mockEncounterStates.draft()) => {
    mockService.getEncounterById.mockResolvedValue({
      success: true,
      data: encounter,
    });
  },

  setupErrorMock: (mockService: any, error = 'Test error') => {
    mockService.getEncounterById.mockResolvedValue({
      success: false,
      error,
    });
  },

  setupLoadingMock: (mockService: any) => {
    mockService.getEncounterById.mockImplementation(() =>
      new Promise(() => {}) // Never resolves to simulate loading
    );
  },
};

/**
 * User interaction helpers
 */
export const interactionHelpers = {
  clickButton: async (user: any, screen: any, buttonText: string) => {
    await waitFor(() => {
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });
    await user.click(screen.getByText(buttonText));
  },

  clickButtonAndWaitFor: async (user: any, screen: any, buttonText: string, expectedText: string) => {
    await interactionHelpers.clickButton(user, screen, buttonText);
    await waitFor(() => {
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  },

  checkboxAction: async (user: any, screen: any, checkboxes: HTMLElement[], index: number) => {
    await user.click(checkboxes[index]);
    expect(checkboxes[index]).toBeChecked();
  },
};