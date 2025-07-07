import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('RoundTracker', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
    
    mockProps = {
      encounter: mockEncounter,
      onRoundChange: jest.fn(),
      onEffectExpiry: jest.fn(),
      onTriggerAction: jest.fn(),
    };
  });

  describe('Round Counter', () => {
    it('displays current round number', () => {
      render(<RoundTracker {...mockProps} />);
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });

    it('calls onRoundChange when increment button is clicked', () => {
      render(<RoundTracker {...mockProps} />);
      
      const incrementButton = screen.getByRole('button', { name: /next round/i });
      fireEvent.click(incrementButton);
      
      expect(mockProps.onRoundChange).toHaveBeenCalledWith(3);
    });

    it('calls onRoundChange when decrement button is clicked', () => {
      mockEncounter.combatState.currentRound = 3;
      render(<RoundTracker {...mockProps} />);
      
      const decrementButton = screen.getByRole('button', { name: /previous round/i });
      fireEvent.click(decrementButton);
      
      expect(mockProps.onRoundChange).toHaveBeenCalledWith(2);
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
        expect(mockProps.onRoundChange).toHaveBeenCalledWith(5);
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

  describe('Round Duration Tracking', () => {
    it('displays round duration when available', () => {
      render(<RoundTracker {...mockProps} estimatedRoundDuration={60} />);
      expect(screen.getByText('~1m per round')).toBeInTheDocument();
    });

    it('displays total combat duration', () => {
      mockEncounter.combatState.startedAt = new Date(Date.now() - 300000); // 5 minutes ago
      render(<RoundTracker {...mockProps} />);
      
      expect(screen.getByText(/total: 5m/i)).toBeInTheDocument();
    });

    it('estimates remaining time when round limit is set', () => {
      render(<RoundTracker {...mockProps} maxRounds={10} estimatedRoundDuration={60} />);
      
      expect(screen.getByText(/estimated: 8m remaining/i)).toBeInTheDocument();
    });

    it('shows overtime warning when past max rounds', () => {
      mockEncounter.combatState.currentRound = 11;
      render(<RoundTracker {...mockProps} maxRounds={10} />);
      
      expect(screen.getByText(/overtime/i)).toBeInTheDocument();
    });
  });

  describe('Round-based Effects', () => {
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

    it('displays active effects', () => {
      render(<RoundTracker {...mockProps} effects={mockEffects} />);
      
      expect(screen.getByText('Poison')).toBeInTheDocument();
      expect(screen.getByText('Bless')).toBeInTheDocument();
    });

    it('shows remaining duration for effects', () => {
      render(<RoundTracker {...mockProps} effects={mockEffects} />);
      
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
      
      render(<RoundTracker {...mockProps} effects={expiringEffects} />);
      
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
      
      render(<RoundTracker {...mockProps} effects={expiringEffects} />);
      
      const nextRoundButton = screen.getByRole('button', { name: /next round/i });
      fireEvent.click(nextRoundButton);
      
      expect(mockProps.onEffectExpiry).toHaveBeenCalledWith(['effect1']);
    });

    it('groups effects by participant', () => {
      render(<RoundTracker {...mockProps} effects={mockEffects} />);
      
      expect(screen.getByText('Test Character 1')).toBeInTheDocument();
      expect(screen.getByText('Test Character 2')).toBeInTheDocument();
    });
  });

  describe('Round History', () => {
    const mockHistory = [
      { round: 1, events: ['Combat started', 'Rogue attacks Goblin'] },
      { round: 2, events: ['Wizard casts Fireball', 'Goblin takes damage'] },
    ];

    it('displays round history when enabled', () => {
      render(<RoundTracker {...mockProps} showHistory={true} history={mockHistory} />);
      
      expect(screen.getByText('Round History')).toBeInTheDocument();
      expect(screen.getByText('Combat started')).toBeInTheDocument();
      expect(screen.getByText('Wizard casts Fireball')).toBeInTheDocument();
    });

    it('collapses history by default', () => {
      render(<RoundTracker {...mockProps} showHistory={true} history={mockHistory} />);
      
      const historyButton = screen.getByRole('button', { name: /show history/i });
      expect(historyButton).toBeInTheDocument();
      
      expect(screen.queryByText('Combat started')).not.toBeInTheDocument();
    });

    it('expands history when clicked', () => {
      render(<RoundTracker {...mockProps} showHistory={true} history={mockHistory} />);
      
      const historyButton = screen.getByRole('button', { name: /show history/i });
      fireEvent.click(historyButton);
      
      expect(screen.getByText('Combat started')).toBeInTheDocument();
    });
  });

  describe('Round Triggers and Reminders', () => {
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

    it('displays upcoming triggers', () => {
      render(<RoundTracker {...mockProps} triggers={mockTriggers} />);
      
      expect(screen.getByText('Lair Action')).toBeInTheDocument();
      expect(screen.getByText('Round 3')).toBeInTheDocument();
    });

    it('highlights triggers due this round', () => {
      mockEncounter.combatState.currentRound = 3;
      render(<RoundTracker {...mockProps} triggers={mockTriggers} />);
      
      const triggerElement = screen.getByText('Lair Action').closest('[data-due]');
      expect(triggerElement).toBeInTheDocument();
    });

    it('calls onTriggerAction when trigger is activated', () => {
      mockEncounter.combatState.currentRound = 3;
      render(<RoundTracker {...mockProps} triggers={mockTriggers} />);
      
      const activateButton = screen.getByRole('button', { name: /activate lair action/i });
      fireEvent.click(activateButton);
      
      expect(mockProps.onTriggerAction).toHaveBeenCalledWith('trigger1');
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
      render(<RoundTracker {...mockProps} triggers={completedTriggers} />);
      
      expect(screen.getByText('Triggered in Round 3')).toBeInTheDocument();
    });
  });

  describe('Export and Summary', () => {
    it('provides export functionality', () => {
      render(<RoundTracker {...mockProps} onExport={jest.fn()} />);
      
      const exportButton = screen.getByRole('button', { name: /export round data/i });
      fireEvent.click(exportButton);
      
      expect(mockProps.onExport).toHaveBeenCalled();
    });

    it('shows session summary when available', () => {
      const summary = {
        totalRounds: 5,
        totalDuration: 1800, // 30 minutes
        participantActions: 15,
        damageDealt: 120,
        healingApplied: 45,
      };
      
      render(<RoundTracker {...mockProps} sessionSummary={summary} />);
      
      expect(screen.getByText('5 rounds')).toBeInTheDocument();
      expect(screen.getByText('30m total')).toBeInTheDocument();
      expect(screen.getByText('15 actions')).toBeInTheDocument();
    });

    it('calculates average round duration', () => {
      const summary = {
        totalRounds: 5,
        totalDuration: 300, // 5 minutes
      };
      
      render(<RoundTracker {...mockProps} sessionSummary={summary} />);
      
      expect(screen.getByText('1m/round avg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
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
      render(<RoundTracker {...mockProps} />);
      
      const nextRoundButton = screen.getByRole('button', { name: /next round/i });
      fireEvent.click(nextRoundButton);
      
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
      
      render(<RoundTracker {...mockProps} effects={mockEffects} />);
      
      const effectElement = screen.getByLabelText(/poison effect on test character 1/i);
      expect(effectElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<RoundTracker {...mockProps} />);
      
      // Re-render with same props
      rerender(<RoundTracker {...mockProps} />);
      
      // Should not cause additional API calls or state changes
      expect(mockProps.onRoundChange).not.toHaveBeenCalled();
    });

    it('handles large numbers of effects efficiently', () => {
      const manyEffects = Array.from({ length: 100 }, (_, i) => ({
        id: `effect${i}`,
        name: `Effect ${i}`,
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 10,
        startRound: 1,
        description: `Test effect ${i}`,
      }));
      
      const startTime = performance.now();
      render(<RoundTracker {...mockProps} effects={manyEffects} />);
      const endTime = performance.now();
      
      // Should render in reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('handles missing encounter gracefully', () => {
      render(<RoundTracker {...mockProps} encounter={null} />);
      
      expect(screen.getByText('No combat active')).toBeInTheDocument();
    });

    it('handles invalid round numbers', () => {
      mockEncounter.combatState.currentRound = -1;
      render(<RoundTracker {...mockProps} />);
      
      expect(screen.getByText('Round 1')).toBeInTheDocument(); // Should default to 1
    });

    it('shows error state when effects fail to load', () => {
      render(<RoundTracker {...mockProps} effectsError="Failed to load effects" />);
      
      expect(screen.getByText('Failed to load effects')).toBeInTheDocument();
    });
  });
});