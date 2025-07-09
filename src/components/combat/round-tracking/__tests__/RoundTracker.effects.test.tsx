import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, createMockProps, convertToNewProps } from './shared-test-utils';
import { PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('RoundTracker - Round-based Effects', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  const mockEffects = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
    mockProps = createMockProps(mockEncounter);
  });

  it('displays active effects', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: mockEffects })} />);

    expect(screen.getByText('Poison')).toBeInTheDocument();
    expect(screen.getByText('Bless')).toBeInTheDocument();
  });

  it('shows remaining duration for effects', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: mockEffects })} />);

    expect(screen.getByText('2 rounds')).toBeInTheDocument(); // Poison: 3 - (2-1) = 2
    expect(screen.getByText('10 rounds')).toBeInTheDocument(); // Bless: 10 - (2-2) = 10
  });

  it('highlights expiring effects', () => {
    const expiringEffects = [
      {
        ...mockEffects[0],
        duration: 2,
        startRound: 1,
      },
    ];

    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: expiringEffects })} />);

    const effectElement = screen.getByText('Poison').closest('[data-expiring]');
    expect(effectElement).toBeInTheDocument();
  });

  it('calls onEffectExpiry when effects expire', () => {
    const expiringEffects = [
      {
        ...mockEffects[0],
        duration: 1,
        startRound: 1,
      },
    ];

    const mockOnEffectExpiry = jest.fn();
    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: expiringEffects, onEffectExpiry: mockOnEffectExpiry })} />);

    const nextRoundButton = screen.getByRole('button', { name: /next round/i });
    fireEvent.click(nextRoundButton);

    expect(mockOnEffectExpiry).toHaveBeenCalledWith(['effect1']);
  });

  it('groups effects by participant', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: mockEffects })} />);

    expect(screen.getByText('Test Character 1')).toBeInTheDocument();
    expect(screen.getByText('Test Character 2')).toBeInTheDocument();
  });
});