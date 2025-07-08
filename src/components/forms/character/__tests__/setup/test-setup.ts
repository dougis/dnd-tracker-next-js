/**
 * Centralized test setup utilities to reduce code duplication
 */

import { CharacterService } from '@/lib/services/CharacterService';
import { NPCTemplateService } from '@/lib/services/NPCTemplateService';

// Mock setup functions - centralized configuration
export const setupCharacterServiceMock = (mockImplementation?: any) => {
  const mockCharacterService = {
    createCharacter: jest.fn(),
    updateCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    getCharacter: jest.fn(),
    getCharacters: jest.fn(),
  };

  if (mockImplementation) {
    mockCharacterService.createCharacter.mockResolvedValue(mockImplementation);
  } else {
    // Default successful response
    mockCharacterService.createCharacter.mockResolvedValue({
      success: true,
      data: {
        _id: 'test-char-id',
        name: 'Test Character',
        type: 'pc',
        race: 'human',
        size: 'medium',
        classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
        abilityScores: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 10,
          charisma: 8,
        },
        hitPoints: { maximum: 10, current: 10, temporary: 0 },
        armorClass: 16,
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
        skills: {},
        equipment: [],
        spells: [],
        ownerId: 'test-owner-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return mockCharacterService;
};

export const setupNPCTemplateServiceMock = (mockTemplates?: any[]) => {
  const mockNPCTemplateService = {
    getTemplates: jest.fn(),
    getTemplate: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
  };

  const defaultTemplates = [
    {
      id: 'template1',
      name: 'Guard',
      category: 'humanoid' as const,
      challengeRating: 0.125 as const,
      size: 'medium' as const,
      stats: {
        abilityScores: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
        hitPoints: { maximum: 11, current: 11, temporary: 0 },
        armorClass: 16,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {},
        skills: {},
        damageVulnerabilities: [],
        damageResistances: [],
        damageImmunities: [],
        conditionImmunities: [],
        senses: [],
        languages: [],
      },
      equipment: [],
      spells: [],
      actions: [],
      behavior: {
        personality: 'Disciplined',
        motivations: 'Protect',
        tactics: 'Defensive'
      },
      isSystem: true,
    },
  ];

  mockNPCTemplateService.getTemplates.mockResolvedValue({
    success: true,
    data: mockTemplates || defaultTemplates,
  });

  return mockNPCTemplateService;
};

export const setupNextNavigationMock = () => {
  const mockPush = jest.fn();
  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: mockPush,
    }),
  }));
  return mockPush;
};

// Common setup function that can be called in beforeEach
export const setupCommonMocks = (options: {
  characterService?: any;
  npcTemplateService?: any[];
  includeRouter?: boolean;
} = {}) => {
  jest.clearAllMocks();

  const mocks = {
    characterService: setupCharacterServiceMock(options.characterService),
    npcTemplateService: options.npcTemplateService ? setupNPCTemplateServiceMock(options.npcTemplateService) : null,
    router: options.includeRouter ? setupNextNavigationMock() : null,
  };

  // Setup scrollIntoView mock for Select components
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    value: jest.fn(),
    writable: true,
  });

  return mocks;
};

// Common beforeEach setup for different test types
export const setupFormComponentTest = (options?: any) => {
  return setupCommonMocks({
    includeRouter: true,
    ...options,
  });
};

export const setupHookTest = (options?: any) => {
  return setupCommonMocks({
    includeRouter: false,
    ...options,
  });
};

export const setupNPCFormTest = (options?: any) => {
  return setupCommonMocks({
    includeRouter: true,
    npcTemplateService: [],
    ...options,
  });
};