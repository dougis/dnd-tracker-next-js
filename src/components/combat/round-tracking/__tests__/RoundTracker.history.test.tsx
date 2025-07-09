import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, convertToNewProps } from './shared-test-utils';

describe('RoundTracker - Round History', () => {
  let mockEncounter: IEncounter;

  const mockHistory = [
    { round: 1, events: ['Combat started', 'Rogue attacks Goblin'] },
    { round: 2, events: ['Wizard casts Fireball', 'Goblin takes damage'] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
  });

  it('displays round history when enabled', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { showHistory: true, history: mockHistory })} />);

    expect(screen.getByText('Round History')).toBeInTheDocument();

    // History should be collapsed by default, so expand it
    const historyButton = screen.getByRole('button', { name: /show history/i });
    fireEvent.click(historyButton);

    expect(screen.getByText('Combat started')).toBeInTheDocument();
    expect(screen.getByText('Wizard casts Fireball')).toBeInTheDocument();
  });

  it('collapses history by default', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { showHistory: true, history: mockHistory })} />);

    const historyButton = screen.getByRole('button', { name: /show history/i });
    expect(historyButton).toBeInTheDocument();

    expect(screen.queryByText('Combat started')).not.toBeInTheDocument();
  });

  it('expands history when clicked', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { showHistory: true, history: mockHistory })} />);

    const historyButton = screen.getByRole('button', { name: /show history/i });
    fireEvent.click(historyButton);

    expect(screen.getByText('Combat started')).toBeInTheDocument();
  });
});