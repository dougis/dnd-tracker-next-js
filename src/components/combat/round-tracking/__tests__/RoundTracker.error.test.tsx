import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, createMockProps, convertToNewProps } from './shared-test-utils';

describe('RoundTracker - Error Handling', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
    mockProps = createMockProps(mockEncounter);
  });

  it('handles missing encounter gracefully', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { encounter: null })} />);

    expect(screen.getByText('No combat active')).toBeInTheDocument();
  });

  it('handles invalid round numbers', () => {
    mockEncounter.combatState.currentRound = -1;
    render(<RoundTracker {...mockProps} />);

    expect(screen.getByText('Round 1')).toBeInTheDocument(); // Should default to 1
  });

  it('shows error state when effects fail to load', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { effectsError: "Failed to load effects" })} />);

    expect(screen.getByText('Failed to load effects')).toBeInTheDocument();
  });
});