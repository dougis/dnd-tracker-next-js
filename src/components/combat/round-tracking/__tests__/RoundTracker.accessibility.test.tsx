import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, createMockProps, convertToNewProps } from './shared-test-utils';
import { PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('RoundTracker - Accessibility', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
    mockProps = createMockProps(mockEncounter);
  });

  it('has proper heading structure', () => {
    render(<RoundTracker {...mockProps} />);

    expect(screen.getByRole('heading', { name: /round 2/i })).toBeInTheDocument();
  });

  it('has accessible button labels', () => {
    render(<RoundTracker {...mockProps} />);

    expect(screen.getByRole('button', { name: /next round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit round/i })).toBeInTheDocument();
  });

  it('announces round changes to screen readers', () => {
    const { rerender } = render(<RoundTracker {...mockProps} />);

    // Initially no announcement
    expect(screen.queryByText(/Round changed to/)).not.toBeInTheDocument();

    // Update the round to trigger announcement
    mockEncounter.combatState.currentRound = 3;
    rerender(<RoundTracker {...mockProps} />);

    // Should show announcement
    expect(screen.getByText('Round changed to 3')).toBeInTheDocument();
  });

  it('has proper ARIA labels for effects', () => {
    const mockEffects = [
      {
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 3,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      },
    ];

    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: mockEffects })} />);

    const effectElement = screen.getByLabelText(/poison effect on test character 1/i);
    expect(effectElement).toBeInTheDocument();
  });
});