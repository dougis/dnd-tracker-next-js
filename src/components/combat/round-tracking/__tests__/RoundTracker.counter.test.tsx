import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, createMockProps } from './shared-test-utils';

describe('RoundTracker - Round Counter', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
    mockProps = createMockProps(mockEncounter);
  });

  it('displays current round number', () => {
    render(<RoundTracker {...mockProps} />);
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('calls onRoundChange when increment button is clicked', () => {
    render(<RoundTracker {...mockProps} />);

    const incrementButton = screen.getByRole('button', { name: /next round/i });
    fireEvent.click(incrementButton);

    expect(mockProps.handlers.onRoundChange).toHaveBeenCalledWith(3);
  });

  it('calls onRoundChange when decrement button is clicked', () => {
    mockEncounter.combatState.currentRound = 3;
    render(<RoundTracker {...mockProps} />);

    const decrementButton = screen.getByRole('button', { name: /previous round/i });
    fireEvent.click(decrementButton);

    expect(mockProps.handlers.onRoundChange).toHaveBeenCalledWith(2);
  });

  it('disables decrement button at round 1', () => {
    mockEncounter.combatState.currentRound = 1;
    render(<RoundTracker {...mockProps} />);

    const decrementButton = screen.getByRole('button', { name: /previous round/i });
    expect(decrementButton).toBeDisabled();
  });

  it('shows manual round input when edit mode is enabled', () => {
    render(<RoundTracker {...mockProps} />);

    const editButton = screen.getByRole('button', { name: /edit round/i });
    fireEvent.click(editButton);

    expect(screen.getByLabelText(/current round/i)).toBeInTheDocument();
  });

  it('saves manual round input when confirmed', async () => {
    render(<RoundTracker {...mockProps} />);

    const editButton = screen.getByRole('button', { name: /edit round/i });
    fireEvent.click(editButton);

    const input = screen.getByLabelText(/current round/i);
    fireEvent.change(input, { target: { value: '5' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockProps.handlers.onRoundChange).toHaveBeenCalledWith(5);
    });
  });

  it('validates manual round input', async () => {
    render(<RoundTracker {...mockProps} />);

    const editButton = screen.getByRole('button', { name: /edit round/i });
    fireEvent.click(editButton);

    const input = screen.getByLabelText(/current round/i);
    fireEvent.change(input, { target: { value: '0' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Round must be at least 1')).toBeInTheDocument();
    });
  });
});