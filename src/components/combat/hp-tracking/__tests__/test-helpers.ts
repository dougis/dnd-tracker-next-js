import { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { createTestParticipant } from '@/lib/models/encounter/__tests__/test-helpers';

/**
 * Shared test utilities for HP tracking components
 */

// Common mock functions factory
export function createHPTrackingMocks() {
  return {
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onDamage: jest.fn(),
    onHealing: jest.fn(),
    onEdit: jest.fn(),
    onUpdate: jest.fn(),
    onErrorChange: jest.fn(),
  };
}

// Standard test participant factory
export function createTestHPParticipant(overrides: Partial<IParticipantReference> = {}): IParticipantReference {
  return createTestParticipant({
    name: 'Test Character',
    maxHitPoints: 100,
    currentHitPoints: 75,
    temporaryHitPoints: 5,
    ...overrides,
  });
}

// Test setup helper
export function setupHPTrackingTest() {
  const mocks = createHPTrackingMocks();
  const participant = createTestHPParticipant();

  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  return { mocks, participant };
}

// Common test scenarios
export const TEST_SCENARIOS = {
  healthy: {
    currentHitPoints: 100,
    maxHitPoints: 100,
    temporaryHitPoints: 0,
  },
  injured: {
    currentHitPoints: 75,
    maxHitPoints: 100,
    temporaryHitPoints: 5,
  },
  critical: {
    currentHitPoints: 20,
    maxHitPoints: 100,
    temporaryHitPoints: 0,
  },
  unconscious: {
    currentHitPoints: 0,
    maxHitPoints: 100,
    temporaryHitPoints: 0,
  },
} as const;

// Helper for creating test participants with specific HP scenarios
export function createScenarioParticipant(scenario: keyof typeof TEST_SCENARIOS, name = 'Test Character') {
  return createTestHPParticipant({
    name,
    ...TEST_SCENARIOS[scenario],
  });
}