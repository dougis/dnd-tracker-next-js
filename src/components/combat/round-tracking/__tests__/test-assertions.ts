import { screen } from '@testing-library/react';

/**
 * Centralized assertion helpers for round tracking tests
 */
export class RoundTrackingAssertions {

  /**
   * Asserts that a round change callback was called with expected parameters
   */
  static expectRoundChange(mockFn: jest.Mock, expectedRound: number) {
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({
      currentRound: expectedRound,
    }));
  }

  /**
   * Asserts that effect expiry callback was called with expected effect IDs
   */
  static expectEffectExpiry(mockFn: jest.Mock, effectIds: string[]) {
    expect(mockFn).toHaveBeenCalledWith(effectIds);
  }

  /**
   * Asserts that trigger activation callback was called
   */
  static expectTriggerActivation(mockFn: jest.Mock, triggerId: string, trigger?: any) {
    if (trigger) {
      expect(mockFn).toHaveBeenCalledWith(triggerId, trigger);
    } else {
      expect(mockFn).toHaveBeenCalledWith(triggerId);
    }
  }

  /**
   * Asserts that the round display shows the expected round number
   */
  static expectRoundDisplay(round: number) {
    expect(screen.getByText(`Round ${round}`)).toBeInTheDocument();
  }

  /**
   * Asserts that an effect is displayed with remaining duration
   */
  static expectEffectDisplay(effectName: string, remainingRounds?: number) {
    expect(screen.getByText(effectName)).toBeInTheDocument();
    if (remainingRounds !== undefined) {
      expect(screen.getByText(`${remainingRounds} rounds`)).toBeInTheDocument();
    }
  }

  /**
   * Asserts that a trigger is displayed with expected round
   */
  static expectTriggerDisplay(triggerName: string, triggerRound?: number) {
    expect(screen.getByText(triggerName)).toBeInTheDocument();
    if (triggerRound !== undefined) {
      expect(screen.getByText(`Round ${triggerRound}`)).toBeInTheDocument();
    }
  }

  /**
   * Asserts that duration is displayed correctly
   */
  static expectDurationDisplay(formatted: string) {
    expect(screen.getByText(new RegExp(formatted, 'i'))).toBeInTheDocument();
  }

  /**
   * Asserts that error message is displayed
   */
  static expectErrorMessage(message: string) {
    expect(screen.getByText(message)).toBeInTheDocument();
  }

  /**
   * Asserts that no error is displayed
   */
  static expectNoError() {
    const errorElements = screen.queryAllByRole('alert');
    const errorTexts = errorElements.map(el => el.textContent);
    expect(errorTexts.filter(text => text && text.includes('error'))).toHaveLength(0);
  }

  /**
   * Asserts that accessibility elements are present
   */
  static expectAccessibleRoundControls() {
    expect(screen.getByRole('button', { name: /next round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit round/i })).toBeInTheDocument();
  }

  /**
   * Asserts that session summary is displayed with expected values
   */
  static expectSessionSummary(summary: { totalRounds: number; totalDuration: number; totalActions?: number }) {
    expect(screen.getByText(`${summary.totalRounds} rounds`)).toBeInTheDocument();

    if (summary.totalDuration) {
      const minutes = Math.floor(summary.totalDuration / 60);
      expect(screen.getByText(`${minutes}m total`)).toBeInTheDocument();
    }

    if (summary.totalActions) {
      expect(screen.getByText(`${summary.totalActions} actions`)).toBeInTheDocument();
    }
  }

  /**
   * Asserts that history entry is displayed
   */
  static expectHistoryEntry(round: number, event: string) {
    const historySection = screen.getByText('Round History').closest('[data-testid="history-section"]');
    if (historySection) {
      expect(historySection).toHaveTextContent(`Round ${round}`);
      expect(historySection).toHaveTextContent(event);
    } else {
      expect(screen.getByText(`Round ${round}`)).toBeInTheDocument();
      expect(screen.getByText(event)).toBeInTheDocument();
    }
  }
}