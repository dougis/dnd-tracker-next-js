import { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { createTestParticipant } from '@/lib/models/encounter/__tests__/test-helpers';

export interface HPTrackingMocks {
  onSave: jest.Mock;
  onCancel: jest.Mock;
  onUpdate: jest.Mock;
  onApplyDamage: jest.Mock;
  onApplyHealing: jest.Mock;
  onErrorChange: jest.Mock;
}

export function createHPTrackingMocks(): HPTrackingMocks {
  return {
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onUpdate: jest.fn(),
    onApplyDamage: jest.fn(),
    onApplyHealing: jest.fn(),
    onErrorChange: jest.fn(),
  };
}

export function setupHPTrackingTest(): { mocks: HPTrackingMocks } {
  const mocks = createHPTrackingMocks();

  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  return { mocks };
}

export const TEST_SCENARIOS = {
  healthy: {
    name: 'Healthy Character',
    maxHitPoints: 100,
    currentHitPoints: 100,
    temporaryHitPoints: 0,
  },
  injured: {
    name: 'Injured Character',
    maxHitPoints: 100,
    currentHitPoints: 75,
    temporaryHitPoints: 5,
  },
  critical: {
    name: 'Critical Character',
    maxHitPoints: 100,
    currentHitPoints: 20,
    temporaryHitPoints: 0,
  },
  unconscious: {
    name: 'Unconscious Character',
    maxHitPoints: 100,
    currentHitPoints: 0,
    temporaryHitPoints: 0,
  },
} as const;

export function createTestHPParticipant(
  overrides: Partial<{
    name: string;
    maxHitPoints: number;
    currentHitPoints: number;
    temporaryHitPoints: number;
  }> = {}
): IParticipantReference {
  return createTestParticipant({
    name: 'Test Character',
    maxHitPoints: 100,
    currentHitPoints: 75,
    temporaryHitPoints: 5,
    ...overrides,
  });
}

export function createScenarioParticipant(
  scenario: keyof typeof TEST_SCENARIOS
): IParticipantReference {
  return createTestHPParticipant(TEST_SCENARIOS[scenario]);
}

export const DEFAULT_TEST_VALUES = {
  initialValues: {
    currentHitPoints: 75,
    maxHitPoints: 100,
    temporaryHitPoints: 5,
  },
  errors: {},
} as const;