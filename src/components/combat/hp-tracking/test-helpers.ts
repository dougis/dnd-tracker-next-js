import React from 'react';
import { render, screen, fireEvent, waitFor, act, renderHook } from '@testing-library/react';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { createTestParticipant } from '@/lib/models/encounter/__tests__/test-helpers';

export interface HPTrackingMocks {
  onSave: jest.Mock;
  onCancel: jest.Mock;
  onUpdate: jest.Mock;
  onApplyDamage: jest.Mock;
  onApplyHealing: jest.Mock;
  onErrorChange: jest.Mock;
  onDamage: jest.Mock;
  onHealing: jest.Mock;
  onEdit: jest.Mock;
}

export function createHPTrackingMocks(): HPTrackingMocks {
  return {
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onUpdate: jest.fn(),
    onApplyDamage: jest.fn(),
    onApplyHealing: jest.fn(),
    onErrorChange: jest.fn(),
    onDamage: jest.fn(),
    onHealing: jest.fn(),
    onEdit: jest.fn(),
  };
}

export function setupHPTrackingTest(): { mocks: HPTrackingMocks } {
  const mocks = createHPTrackingMocks();
  return { mocks };
}

export function setupHPTrackingHooks() {
  const { mocks } = setupHPTrackingTest();

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

// Component Rendering Utilities
export function renderHPEditModal(
  overrides: Partial<{
    participant: IParticipantReference;
    isOpen: boolean;
    onSave: jest.Mock;
    onCancel: jest.Mock;
  }> = {}
) {
  const { mocks } = setupHPTrackingTest();
  const mockParticipant = createTestHPParticipant();

  const defaultProps = {
    participant: mockParticipant,
    isOpen: true,
    onSave: mocks.onSave,
    onCancel: mocks.onCancel,
    ...overrides,
  };

  // Import HPEditModal dynamically to avoid circular dependencies
  const HPEditModal = require('./HPEditModal').HPEditModal;

  return {
    ...render(React.createElement(HPEditModal, defaultProps)),
    mocks,
    participant: mockParticipant,
  };
}

export function renderHPEditForm(
  overrides: Partial<{
    initialValues: { currentHitPoints: number; maxHitPoints: number; temporaryHitPoints: number };
    onSave: jest.Mock;
    onCancel: jest.Mock;
  }> = {}
) {
  const { mocks } = setupHPTrackingTest();

  const defaultProps = {
    initialValues: TEST_SCENARIOS.injured,
    onSave: mocks.onSave,
    onCancel: mocks.onCancel,
    ...overrides,
  };

  // Import HPEditForm dynamically to avoid circular dependencies
  const HPEditForm = require('./HPEditForm').HPEditForm;

  return {
    ...render(React.createElement(HPEditForm, defaultProps)),
    mocks,
  };
}

// HP Action Testing Utilities
async function testHPAction(
  actionType: 'damage' | 'healing',
  amount: number,
  expectedCurrentHP: number,
  expectedStatus: string
) {
  const inputLabel = actionType === 'damage' ? 'Damage Amount' : 'Healing Amount';
  const buttonTestId = `apply-${actionType}-button`;

  const input = screen.getByLabelText(inputLabel);
  const button = screen.getByTestId(buttonTestId);

  fireEvent.change(input, { target: { value: amount.toString() } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByLabelText('Current HP')).toHaveValue(expectedCurrentHP);
    expect(screen.getByText(expectedStatus)).toBeInTheDocument();
  });
}

export async function testDamageApplication(
  damageAmount: number,
  expectedCurrentHP: number,
  expectedStatus: string
) {
  return testHPAction('damage', damageAmount, expectedCurrentHP, expectedStatus);
}

export async function testHealingApplication(
  healingAmount: number,
  expectedCurrentHP: number,
  expectedStatus: string
) {
  return testHPAction('healing', healingAmount, expectedCurrentHP, expectedStatus);
}

export async function testTemporaryHPChange(
  tempHPAmount: number,
  expectedStatus: string
) {
  const tempHPInput = screen.getByLabelText('Temporary HP');
  fireEvent.change(tempHPInput, { target: { value: tempHPAmount.toString() } });

  await waitFor(() => {
    expect(screen.getByText(expectedStatus)).toBeInTheDocument();
  });
}

// Validation Testing Utilities
export async function testFieldValidation(
  fieldLabel: string,
  invalidValue: string,
  expectedErrorMessage: string
) {
  const input = screen.getByLabelText(fieldLabel);
  const saveButton = screen.getByText('Save');

  fireEvent.change(input, { target: { value: invalidValue } });
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
  });
}

export async function testInputValidation(
  inputLabel: string,
  buttonTestId: string,
  invalidValue: string,
  expectedErrorMessage: string
) {
  const input = screen.getByLabelText(inputLabel);
  const button = screen.getByTestId(buttonTestId);

  fireEvent.change(input, { target: { value: invalidValue } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
  });
}

// Assertion Utilities
export function expectHPStatus(
  currentHP: number,
  maxHP: number,
  tempHP: number = 0
) {
  const effectiveHP = currentHP + tempHP;
  const statusText = tempHP > 0
    ? `Status: ${currentHP}/${maxHP} (+${tempHP}) = ${effectiveHP} effective HP`
    : `Status: ${currentHP}/${maxHP} = ${effectiveHP} effective HP`;

  expect(screen.getByText(statusText)).toBeInTheDocument();
}

export function expectHPInputValues(
  currentHP: number,
  maxHP: number,
  tempHP: number = 0
) {
  expect(screen.getByLabelText('Current HP')).toHaveValue(currentHP);
  expect(screen.getByLabelText('Maximum HP')).toHaveValue(maxHP);
  expect(screen.getByLabelText('Temporary HP')).toHaveValue(tempHP);
}

export function expectHPSaveCall(
  mockFn: jest.Mock,
  currentHP: number,
  maxHP: number,
  tempHP: number = 0
) {
  expect(mockFn).toHaveBeenCalledWith({
    currentHitPoints: currentHP,
    maxHitPoints: maxHP,
    temporaryHitPoints: tempHP,
  });
}

// Hook Testing Utilities - Individual action testers to reduce complexity
export function testDamageAction(damage: number, expectedResult: { currentHP: number; tempHP: number; effectiveHP: number }) {
  const useHPTracking = require('../useHPTracking').useHPTracking;
  const { result } = renderHook(() => useHPTracking(createTestHPParticipant(), jest.fn()));

  act(() => result.current.applyDamage(damage));

  expect(result.current.currentHP).toBe(expectedResult.currentHP);
  expect(result.current.tempHP).toBe(expectedResult.tempHP);
  expect(result.current.effectiveHP).toBe(expectedResult.effectiveHP);
}

export function testHealingAction(healing: number, expectedCurrentHP: number) {
  const useHPTracking = require('../useHPTracking').useHPTracking;
  const { result } = renderHook(() => useHPTracking(createTestHPParticipant(), jest.fn()));

  act(() => result.current.applyHealing(healing));
  expect(result.current.currentHP).toBe(expectedCurrentHP);
}

export function testSetTempHPAction(tempHP: number, expectedTempHP: number) {
  const useHPTracking = require('../useHPTracking').useHPTracking;
  const { result } = renderHook(() => useHPTracking(createTestHPParticipant(), jest.fn()));

  act(() => result.current.setTemporaryHP(tempHP));
  expect(result.current.tempHP).toBe(expectedTempHP);
}

export function renderHPQuickButtons(overrides = {}) {
  const HPQuickButtons = require('./HPQuickButtons').HPQuickButtons;
  return render(React.createElement(HPQuickButtons, overrides));
}