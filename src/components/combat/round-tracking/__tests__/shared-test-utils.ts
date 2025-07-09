import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';

export function createMockEncounter(): IEncounter {
  const mockEncounter = createTestEncounter();
  makeEncounterActive(mockEncounter);
  return mockEncounter;
}

export function createMockProps(mockEncounter: IEncounter, overrides: any = {}) {
  return {
    data: {
      encounter: mockEncounter,
      effects: [],
      triggers: [],
      history: [],
      ...overrides.data,
    },
    settings: {
      showHistory: false,
      ...overrides.settings,
    },
    handlers: {
      onRoundChange: jest.fn(),
      onEffectExpiry: jest.fn(),
      onTriggerAction: jest.fn(),
      ...overrides.handlers,
    },
    ...overrides,
  };
}

// Helper function to convert old props to new structure
export function convertToNewProps(mockEncounter: IEncounter, overrides: any = {}) {
  const {
    encounter = mockEncounter,
    effects,
    triggers,
    history,
    sessionSummary,
    effectsError,
    maxRounds,
    estimatedRoundDuration,
    showHistory,
    onRoundChange = jest.fn(),
    onEffectExpiry = jest.fn(),
    onTriggerAction = jest.fn(),
    onExport,
    ...otherProps
  } = overrides;

  return {
    data: {
      encounter,
      effects: effects || [],
      triggers: triggers || [],
      history: history || [],
      sessionSummary,
      effectsError,
    },
    settings: {
      maxRounds,
      estimatedRoundDuration,
      showHistory: showHistory || false,
    },
    handlers: {
      onRoundChange,
      onEffectExpiry,
      onTriggerAction,
      onExport,
    },
    ...otherProps,
  };
}