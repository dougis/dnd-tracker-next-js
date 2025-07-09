import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, createMockProps, convertToNewProps } from './shared-test-utils';

describe('RoundTracker - Round Duration Tracking', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
    mockProps = createMockProps(mockEncounter);
  });

  it('displays round duration when available', () => {
    // Ensure encounter has startedAt to generate duration
    mockEncounter.combatState.startedAt = new Date(Date.now() - 120000); // 2 minutes ago
    render(<RoundTracker {...convertToNewProps(mockEncounter, { estimatedRoundDuration: 60 })} />);
    expect(screen.getByText('~1m')).toBeInTheDocument();
  });

  it('displays total combat duration', () => {
    mockEncounter.combatState.startedAt = new Date(Date.now() - 300000); // 5 minutes ago
    render(<RoundTracker {...mockProps} />);

    expect(screen.getByText('5m')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('estimates remaining time when round limit is set', () => {
    // Set encounter to have started to enable duration calculations
    mockEncounter.combatState.startedAt = new Date(Date.now() - 120000); // 2 minutes ago
    render(<RoundTracker {...convertToNewProps(mockEncounter, { maxRounds: 10, estimatedRoundDuration: 60 })} />);

    expect(screen.getByText('Estimated')).toBeInTheDocument();
    expect(screen.getByText(/remaining/)).toBeInTheDocument();
  });

  it('shows overtime warning when past max rounds', () => {
    mockEncounter.combatState.currentRound = 11;
    render(<RoundTracker {...convertToNewProps(mockEncounter, { maxRounds: 10 })} />);

    expect(screen.getByText(/overtime/i)).toBeInTheDocument();
  });
});