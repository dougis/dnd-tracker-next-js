import { screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Centralized action helpers for round tracking tests
 */
export class RoundTrackingActions {

  /**
   * Clicks the next round button
   */
  static async clickNextRound() {
    const button = screen.getByRole('button', { name: /next round/i });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeInTheDocument());
    return button;
  }

  /**
   * Clicks the previous round button
   */
  static async clickPreviousRound() {
    const button = screen.getByRole('button', { name: /previous round/i });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeInTheDocument());
    return button;
  }

  /**
   * Edits the round number using the manual input
   */
  static async editRound(newRound: number) {
    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit round/i });
    fireEvent.click(editButton);

    // Change input value
    const input = screen.getByLabelText(/current round/i);
    fireEvent.change(input, { target: { value: newRound.toString() } });

    // Save the change
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Verify the edit was successful
      expect(input).toHaveValue(newRound);
    });

    return { input, saveButton };
  }

  /**
   * Cancels round editing
   */
  static async cancelRoundEdit() {
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    await waitFor(() => expect(cancelButton).toBeInTheDocument());
    return cancelButton;
  }

  /**
   * Activates a trigger by name
   */
  static async activateTrigger(triggerName: string) {
    const activateButton = screen.getByRole('button', {
      name: new RegExp(`activate ${triggerName}`, 'i')
    });
    fireEvent.click(activateButton);
    await waitFor(() => expect(activateButton).toBeInTheDocument());
    return activateButton;
  }

  /**
   * Toggles history display
   */
  static async toggleHistory() {
    const historyButton = screen.getByRole('button', { name: /show history|hide history/i });
    fireEvent.click(historyButton);
    await waitFor(() => expect(historyButton).toBeInTheDocument());
    return historyButton;
  }

  /**
   * Searches history with given query
   */
  static async searchHistory(query: string) {
    // First expand search if needed
    const searchButton = screen.queryByRole('button', { name: /show search/i });
    if (searchButton) {
      fireEvent.click(searchButton);
    }

    const searchInput = screen.getByPlaceholderText(/search history/i);
    fireEvent.change(searchInput, { target: { value: query } });

    await waitFor(() => expect(searchInput).toHaveValue(query));
    return searchInput;
  }

  /**
   * Clears history search
   */
  static async clearHistorySearch() {
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    await waitFor(() => expect(clearButton).toBeInTheDocument());
    return clearButton;
  }

  /**
   * Clicks export button
   */
  static async clickExport() {
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    await waitFor(() => expect(exportButton).toBeInTheDocument());
    return exportButton;
  }

  /**
   * Removes an effect (if remove button exists)
   */
  static async removeEffect(effectName: string) {
    const effectElement = screen.getByText(effectName);
    const removeButton = effectElement.closest('[data-testid^="effect"]')?.querySelector('[data-action="remove"]');

    if (removeButton) {
      fireEvent.click(removeButton);
      await waitFor(() => expect(removeButton).toBeInTheDocument());
      return removeButton;
    }

    throw new Error(`Remove button not found for effect: ${effectName}`);
  }

  /**
   * Sets round input value during editing
   */
  static async setRoundInput(value: string) {
    const input = screen.getByLabelText(/current round/i);
    fireEvent.change(input, { target: { value } });
    await waitFor(() => {
      expect(input).toHaveValue(parseInt(value, 10));
    });
    return input;
  }

  /**
   * Performs a complete round advance sequence
   */
  static async advanceRound() {
    const initialRoundText = screen.getByText(/round \d+/i).textContent;
    const currentRound = parseInt(initialRoundText?.match(/\d+/)?.[0] || '1', 10);

    await this.clickNextRound();

    // Wait for round to update
    await waitFor(() => {
      expect(screen.getByText(`Round ${currentRound + 1}`)).toBeInTheDocument();
    });

    return currentRound + 1;
  }

  /**
   * Performs a complete round retreat sequence
   */
  static async retreatRound() {
    const initialRoundText = screen.getByText(/round \d+/i).textContent;
    const currentRound = parseInt(initialRoundText?.match(/\d+/)?.[0] || '1', 10);

    if (currentRound <= 1) {
      throw new Error('Cannot retreat below round 1');
    }

    await this.clickPreviousRound();

    // Wait for round to update
    await waitFor(() => {
      expect(screen.getByText(`Round ${currentRound - 1}`)).toBeInTheDocument();
    });

    return currentRound - 1;
  }
}