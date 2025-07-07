import { renderHook, act } from '@testing-library/react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { useRoundTracking } from '../useRoundTracking';
import { createMockEncounterWithRound, createUseRoundTrackingMocks } from './round-tracking-test-helpers';

/**
 * Utility for rendering the useRoundTracking hook with standard setup
 */
export function renderRoundTrackingHook(
  encounter: IEncounter = createMockEncounterWithRound(2),
  options: any = {}
) {
  const mocks = createUseRoundTrackingMocks();

  const hookResult = renderHook(() =>
    useRoundTracking(encounter, mocks.onUpdate, options)
  );

  return {
    result: hookResult.result,
    rerender: hookResult.rerender,
    unmount: hookResult.unmount,
    mocks,
    encounter,
  };
}

/**
 * Helper for performing actions and asserting round changes
 */
export function actAndExpectRoundChange(
  result: any,
  action: () => void,
  expectedRound: number,
  mockFn: jest.Mock
) {
  act(action);
  expect(result.current.currentRound).toBe(expectedRound);
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({
    currentRound: expectedRound,
  }));
}

/**
 * Helper for testing effect expiration
 */
export function actAndExpectEffectExpiry(
  result: any,
  action: () => void,
  expectedExpiredIds: string[],
  onEffectExpiry: jest.Mock
) {
  act(action);
  expect(onEffectExpiry).toHaveBeenCalledWith(expectedExpiredIds);
}

/**
 * Helper for testing trigger activation
 */
export function actAndExpectTriggerActivation(
  result: any,
  triggerId: string,
  expectedTrigger: any,
  onTriggerActivation: jest.Mock
) {
  act(() => {
    result.current.activateTrigger(triggerId);
  });
  expect(onTriggerActivation).toHaveBeenCalledWith(triggerId, expectedTrigger);
}

/**
 * Helper for testing error states
 */
export function expectErrorState(result: any, expectedError: string) {
  expect(result.current.error).toBe(expectedError);
}

/**
 * Helper for testing duration calculations
 */
export function expectDurationCalculation(
  result: any,
  expectedTotal: number,
  expectedAverage: number,
  expectedFormatted: string
) {
  expect(result.current.duration.totalSeconds).toBe(expectedTotal);
  expect(result.current.duration.averageRoundDuration).toBe(expectedAverage);
  expect(result.current.duration.formatted).toBe(expectedFormatted);
}

/**
 * Helper for testing effect remaining duration
 */
export function expectEffectRemainingDuration(
  result: any,
  effect: any,
  expectedRemaining: number
) {
  const remaining = result.current.getEffectRemainingDuration(effect);
  expect(remaining).toBe(expectedRemaining);
}

/**
 * Helper for testing history entries
 */
export function expectHistoryLength(result: any, expectedLength: number) {
  expect(result.current.history).toHaveLength(expectedLength);
}

export function expectHistoryEntry(
  result: any,
  entryIndex: number,
  expectedRound: number,
  expectedEvents: string[]
) {
  const entry = result.current.history[entryIndex];
  expect(entry.round).toBe(expectedRound);
  expect(entry.events).toEqual(expectedEvents);
}