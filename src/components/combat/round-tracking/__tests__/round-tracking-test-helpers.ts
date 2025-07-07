import React from 'react';
import { render, screen, fireEvent, waitFor, renderHook } from '@testing-library/react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

/**
 * Test helper utilities for round tracking components
 * Reduces code duplication and provides consistent test patterns
 */

// Mock data types
export interface MockEffect {
  id: string;
  name: string;
  participantId: any;
  duration: number;
  startRound: number;
  description: string;
}

export interface MockTrigger {
  id: string;
  name: string;
  triggerRound: number;
  description: string;
  isActive: boolean;
  triggeredRound?: number;
}

export interface MockHistoryEntry {
  round: number;
  events: string[];
}

export interface MockSessionSummary {
  totalRounds: number;
  totalDuration: number;
  participantActions?: number;
  damageDealt?: number;
  healingApplied?: number;
  totalActions?: number;
}

// Standard test data
export const TEST_EFFECTS: MockEffect[] = [
  {
    id: 'effect1',
    name: 'Poison',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 3,
    startRound: 1,
    description: 'Takes 1d6 poison damage',
  },
  {
    id: 'effect2',
    name: 'Bless',
    participantId: PARTICIPANT_IDS.SECOND,
    duration: 10,
    startRound: 2,
    description: '+1d4 to attacks and saves',
  },
  {
    id: 'effect3',
    name: 'Haste',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 1,
    startRound: 2,
    description: 'Double speed, expiring soon',
  },
];

export const TEST_TRIGGERS: MockTrigger[] = [
  {
    id: 'trigger1',
    name: 'Lair Action',
    triggerRound: 3,
    description: 'The dragon uses its lair action',
    isActive: true,
  },
  {
    id: 'trigger2',
    name: 'Reinforcements',
    triggerRound: 5,
    description: 'Orc reinforcements arrive',
    isActive: true,
  },
  {
    id: 'trigger3',
    name: 'Completed Action',
    triggerRound: 1,
    description: 'Already triggered',
    isActive: false,
    triggeredRound: 1,
  },
];

export const TEST_HISTORY: MockHistoryEntry[] = [
  { round: 1, events: ['Combat started', 'Rogue attacks Goblin'] },
  { round: 2, events: ['Wizard casts Fireball', 'Goblin takes damage'] },
];

export const TEST_SESSION_SUMMARY: MockSessionSummary = {
  totalRounds: 5,
  totalDuration: 1800, // 30 minutes
  participantActions: 15,
  damageDealt: 120,
  healingApplied: 45,
  totalActions: 15,
};

// Mock generators
export function createMockEffect(overrides: Partial<MockEffect> = {}): MockEffect {
  return {
    id: `effect-${Date.now()}`,
    name: 'Test Effect',
    participantId: PARTICIPANT_IDS.FIRST,
    duration: 5,
    startRound: 1,
    description: 'Test effect description',
    ...overrides,
  };
}

export function createMockTrigger(overrides: Partial<MockTrigger> = {}): MockTrigger {
  return {
    id: `trigger-${Date.now()}`,
    name: 'Test Trigger',
    triggerRound: 3,
    description: 'Test trigger description',
    isActive: true,
    ...overrides,
  };
}

export function createMockEncounterWithRound(round: number): IEncounter {
  const encounter = createTestEncounter();
  encounter.combatState.isActive = true;
  encounter.combatState.currentRound = round;
  encounter.combatState.currentTurn = 0;
  encounter.combatState.startedAt = new Date(Date.now() - (round * 60000)); // 1 minute per round
  return encounter;
}

// Component testing utilities
export interface RoundTrackerMocks {
  onRoundChange: jest.Mock;
  onEffectExpiry: jest.Mock;
  onTriggerAction: jest.Mock;
  onExport: jest.Mock;
}

export function createRoundTrackerMocks(): RoundTrackerMocks {
  return {
    onRoundChange: jest.fn(),
    onEffectExpiry: jest.fn(),
    onTriggerAction: jest.fn(),
    onExport: jest.fn(),
  };
}

export function setupRoundTrackerTest(roundNumber = 2) {
  const encounter = createMockEncounterWithRound(roundNumber);
  const mocks = createRoundTrackerMocks();

  const defaultProps = {
    encounter,
    ...mocks,
  };

  return { encounter, mocks, defaultProps };
}

export function setupRoundTrackerHooks() {
  const { encounter, mocks } = setupRoundTrackerTest();

  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  return { encounter, mocks };
}

// Hook testing utilities
export function createUseRoundTrackingMocks() {
  return {
    onUpdate: jest.fn(),
    onEffectExpiry: jest.fn(),
    onTriggerActivation: jest.fn(),
  };
}

export function setupRoundTrackingHook(
  encounter: IEncounter = createMockEncounterWithRound(2),
  options: any = {}
) {
  const mocks = createUseRoundTrackingMocks();

  const hookOptions = {
    initialEffects: [],
    initialTriggers: [],
    maxHistoryRounds: 10,
    ...options,
  };

  return { encounter, mocks, hookOptions };
}

// Interaction testing utilities
export async function clickRoundButton(buttonName: RegExp | string) {
  const button = screen.getByRole('button', { name: buttonName });
  fireEvent.click(button);
  await waitFor(() => {
    expect(button).toBeInTheDocument();
  });
  return button;
}

export async function setRoundInput(value: string) {
  const input = screen.getByLabelText(/current round/i);
  fireEvent.change(input, { target: { value } });
  await waitFor(() => {
    expect(input).toHaveValue(parseInt(value, 10));
  });
  return input;
}

export async function clickEffectButton(effectName: string, action: 'remove' | 'view' = 'view') {
  const effectElement = screen.getByText(effectName);
  const button = effectElement.closest('[data-testid^="effect"]')?.querySelector(`[data-action="${action}"]`);
  if (button) {
    fireEvent.click(button);
    await waitFor(() => {
      expect(button).toBeInTheDocument();
    });
  }
  return button;
}

export async function activateTrigger(triggerName: string) {
  const activateButton = screen.getByRole('button', {
    name: new RegExp(`activate ${triggerName}`, 'i')
  });
  fireEvent.click(activateButton);
  await waitFor(() => {
    expect(activateButton).toBeInTheDocument();
  });
  return activateButton;
}

// Assertion utilities
export function expectRoundDisplay(round: number) {
  expect(screen.getByText(`Round ${round}`)).toBeInTheDocument();
}

export function expectEffectDisplay(effect: MockEffect, remainingDuration?: number) {
  expect(screen.getByText(effect.name)).toBeInTheDocument();
  if (remainingDuration !== undefined) {
    expect(screen.getByText(`${remainingDuration} rounds`)).toBeInTheDocument();
  }
}

export function expectTriggerDisplay(trigger: MockTrigger) {
  expect(screen.getByText(trigger.name)).toBeInTheDocument();
  expect(screen.getByText(`Round ${trigger.triggerRound}`)).toBeInTheDocument();
}

export function expectDurationDisplay(formatted: string) {
  expect(screen.getByText(new RegExp(formatted, 'i'))).toBeInTheDocument();
}

export function expectHistoryEntry(round: number, event: string) {
  const historySection = screen.getByText('Round History').closest('[data-testid="history-section"]');
  if (historySection) {
    expect(historySection).toHaveTextContent(`Round ${round}`);
    expect(historySection).toHaveTextContent(event);
  } else {
    expect(screen.getByText(`Round ${round}`)).toBeInTheDocument();
    expect(screen.getByText(event)).toBeInTheDocument();
  }
}

export function expectSessionSummary(summary: MockSessionSummary) {
  expect(screen.getByText(`${summary.totalRounds} rounds`)).toBeInTheDocument();

  if (summary.totalDuration) {
    const minutes = Math.floor(summary.totalDuration / 60);
    expect(screen.getByText(`${minutes}m total`)).toBeInTheDocument();
  }

  if (summary.totalActions) {
    expect(screen.getByText(`${summary.totalActions} actions`)).toBeInTheDocument();
  }
}

// Error testing utilities
export function expectErrorMessage(message: string) {
  expect(screen.getByText(message)).toBeInTheDocument();
}

export function expectNoError() {
  const errorElements = screen.queryAllByRole('alert');
  const errorTexts = errorElements.map(el => el.textContent);
  expect(errorTexts.filter(text => text && text.includes('error'))).toHaveLength(0);
}

// Accessibility testing utilities
export function expectAccessibleRoundControls() {
  expect(screen.getByRole('button', { name: /next round/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /previous round/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit round/i })).toBeInTheDocument();
}

export function expectAccessibleEffectLabels(effects: MockEffect[]) {
  effects.forEach(effect => {
    const labelRegex = new RegExp(`${effect.name} effect`, 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });
}

export function expectAccessibleTriggerLabels(triggers: MockTrigger[]) {
  triggers.forEach(trigger => {
    if (trigger.isActive) {
      const buttonRegex = new RegExp(`activate ${trigger.name}`, 'i');
      expect(screen.getByRole('button', { name: buttonRegex })).toBeInTheDocument();
    }
  });
}

// Performance testing utilities
export function measureRenderTime(renderFn: () => any): number {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
}

export function expectFastRender(renderFn: () => any, maxTime = 100) {
  const renderTime = measureRenderTime(renderFn);
  expect(renderTime).toBeLessThan(maxTime);
}

// Data validation utilities
export function validateRoundNumber(round: number): boolean {
  return Number.isInteger(round) && round >= 1;
}

export function validateEffect(effect: MockEffect): boolean {
  return (
    typeof effect.id === 'string' &&
    typeof effect.name === 'string' &&
    typeof effect.duration === 'number' &&
    effect.duration > 0 &&
    typeof effect.startRound === 'number' &&
    effect.startRound >= 1
  );
}

export function validateTrigger(trigger: MockTrigger): boolean {
  return (
    typeof trigger.id === 'string' &&
    typeof trigger.name === 'string' &&
    typeof trigger.triggerRound === 'number' &&
    trigger.triggerRound >= 1 &&
    typeof trigger.isActive === 'boolean'
  );
}

// Test scenario builders
export interface RoundTestScenario {
  name: string;
  round: number;
  effects: MockEffect[];
  triggers: MockTrigger[];
  duration?: number;
  maxRounds?: number;
}

export const TEST_SCENARIOS: Record<string, RoundTestScenario> = {
  earlyGame: {
    name: 'Early Game',
    round: 2,
    effects: [TEST_EFFECTS[0]], // Just poison
    triggers: [TEST_TRIGGERS[0]], // Lair action coming up
    duration: 120,
  },
  midGame: {
    name: 'Mid Game',
    round: 5,
    effects: TEST_EFFECTS.slice(0, 2), // Poison and bless
    triggers: TEST_TRIGGERS, // All triggers
    duration: 600,
    maxRounds: 10,
  },
  lateGame: {
    name: 'Late Game',
    round: 8,
    effects: [TEST_EFFECTS[1]], // Just bless remaining
    triggers: [TEST_TRIGGERS[2]], // Completed actions
    duration: 1200,
    maxRounds: 10,
  },
  overtime: {
    name: 'Overtime',
    round: 12,
    effects: [],
    triggers: [],
    duration: 1800,
    maxRounds: 10,
  },
};

export function createScenarioEncounter(scenario: RoundTestScenario): IEncounter {
  const encounter = createMockEncounterWithRound(scenario.round);
  if (scenario.duration) {
    encounter.combatState.startedAt = new Date(Date.now() - (scenario.duration * 1000));
  }
  return encounter;
}

export function getScenario(name: keyof typeof TEST_SCENARIOS): RoundTestScenario {
  return TEST_SCENARIOS[name];
}

// Component rendering utilities with common setups
export function renderRoundTrackerWithScenario(scenarioName: keyof typeof TEST_SCENARIOS, overrides = {}) {
  const scenario = getScenario(scenarioName);
  const encounter = createScenarioEncounter(scenario);
  const mocks = createRoundTrackerMocks();

  const props = {
    encounter,
    effects: scenario.effects,
    triggers: scenario.triggers,
    maxRounds: scenario.maxRounds,
    ...mocks,
    ...overrides,
  };

  // Dynamic import to avoid circular dependencies in tests
  const RoundTracker = require('../RoundTracker').RoundTracker;

  return {
    ...render(React.createElement(RoundTracker, props)),
    encounter,
    mocks,
    scenario,
  };
}

export function renderUseRoundTrackingWithScenario(
  scenarioName: keyof typeof TEST_SCENARIOS,
  overrides = {}
) {
  const scenario = getScenario(scenarioName);
  const encounter = createScenarioEncounter(scenario);
  const mocks = createUseRoundTrackingMocks();

  const options = {
    initialEffects: scenario.effects,
    initialTriggers: scenario.triggers,
    maxRounds: scenario.maxRounds,
    ...overrides,
  };

  const useRoundTracking = require('../useRoundTracking').useRoundTracking;

  return {
    ...renderHook(() => useRoundTracking(encounter, mocks.onUpdate, options)),
    encounter,
    mocks,
    scenario,
  };
}