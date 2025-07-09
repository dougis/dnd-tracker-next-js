import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, convertToNewProps } from './shared-test-utils';

describe('RoundTracker - Round Triggers and Reminders', () => {
  let mockEncounter: IEncounter;

  const mockTriggers = [
    {
      id: 'trigger1',
      name: 'Lair Action',
      triggerRound: 3,
      description: 'The dragon uses its lair action',
      isActive: true,
    },
    {
      id: 'trigger2',
      name: 'Reinforcements',
      triggerRound: 5,
      description: 'Orc reinforcements arrive',
      isActive: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
  });

  it('displays upcoming triggers', () => {
    render(<RoundTracker {...convertToNewProps(mockEncounter, { triggers: mockTriggers })} />);

    expect(screen.getByText('Lair Action')).toBeInTheDocument();
    expect(screen.getByText('Round 3')).toBeInTheDocument();
  });

  it('highlights triggers due this round', () => {
    mockEncounter.combatState.currentRound = 3;
    render(<RoundTracker {...convertToNewProps(mockEncounter, { triggers: mockTriggers })} />);

    const triggerElement = screen.getByText('Lair Action').closest('[data-due]');
    expect(triggerElement).toBeInTheDocument();
  });

  it('calls onTriggerAction when trigger is activated', () => {
    mockEncounter.combatState.currentRound = 3;
    const mockOnTriggerAction = jest.fn();
    render(<RoundTracker {...convertToNewProps(mockEncounter, { triggers: mockTriggers, onTriggerAction: mockOnTriggerAction })} />);

    const activateButton = screen.getByRole('button', { name: /activate lair action/i });
    fireEvent.click(activateButton);

    expect(mockOnTriggerAction).toHaveBeenCalledWith('trigger1');
  });

  it('shows completed triggers', () => {
    const completedTriggers = [
      {
        ...mockTriggers[0],
        isActive: false,
        triggeredRound: 3,
      },
    ];

    mockEncounter.combatState.currentRound = 4;
    render(<RoundTracker {...convertToNewProps(mockEncounter, { triggers: completedTriggers })} />);

    expect(screen.getByText('Triggered in Round 3')).toBeInTheDocument();
  });
});