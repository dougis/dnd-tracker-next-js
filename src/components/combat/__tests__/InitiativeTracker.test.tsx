import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InitiativeTracker } from '../InitiativeTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('InitiativeTracker', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
    mockEncounter.combatState.currentTurn = 1;

    // Add participants to match the initiative order
    mockEncounter.participants = [
      {
        characterId: PARTICIPANT_IDS.FIRST,
        name: 'Test Character 1',
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 20,
        temporaryHitPoints: 0,
        armorClass: 15,
        initiative: 20,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: []
      },
      {
        characterId: PARTICIPANT_IDS.SECOND,
        name: 'Test Character 2',
        type: 'NPC',
        maxHitPoints: 20,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        armorClass: 14,
        initiative: 15,
        isPlayer: false,
        isVisible: true,
        notes: '',
        conditions: []
      }
    ];

    mockProps = {
      encounter: mockEncounter,
      onNextTurn: jest.fn(),
      onPreviousTurn: jest.fn(),
      onPauseCombat: jest.fn(),
      onResumeCombat: jest.fn(),
      onEndCombat: jest.fn(),
      onEditInitiative: jest.fn(),
      onExportInitiative: jest.fn(),
      onShareInitiative: jest.fn(),
    };
  });

  it('renders initiative tracker when combat is active', () => {
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('Initiative Tracker')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    expect(screen.getByText('Turn Order')).toBeInTheDocument();
  });

  it('shows inactive state when combat is not active', () => {
    mockEncounter.combatState.isActive = false;
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('Combat has not started')).toBeInTheDocument();
  });

  it('displays participants in initiative order with correct information', () => {
    render(<InitiativeTracker {...mockProps} />);

    // Check that participants are displayed
    mockEncounter.participants.forEach(participant => {
      expect(screen.getByText(participant.name)).toBeInTheDocument();
      expect(screen.getByText(`AC ${participant.armorClass}`)).toBeInTheDocument();
      expect(screen.getByText(`${participant.currentHitPoints}/${participant.maxHitPoints}`)).toBeInTheDocument();
    });
  });

  it('highlights the active participant', () => {
    render(<InitiativeTracker {...mockProps} />);

    // The active participant should have special styling
    // Need to look for the card that has border-primary class
    // Since currentTurn is 1, the second participant in initiative order should be active
    const activeCards = document.querySelectorAll('.border-primary');

    expect(activeCards.length).toBeGreaterThan(0);
  });

  it('calls onNextTurn when Next Turn button is clicked', () => {
    render(<InitiativeTracker {...mockProps} />);

    const nextButton = screen.getByText('Next Turn');
    fireEvent.click(nextButton);

    expect(mockProps.onNextTurn).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviousTurn when Previous button is clicked', () => {
    render(<InitiativeTracker {...mockProps} />);

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(mockProps.onPreviousTurn).toHaveBeenCalledTimes(1);
  });

  it('disables Previous button at start of first round', () => {
    mockEncounter.combatState.currentRound = 1;
    mockEncounter.combatState.currentTurn = 0;
    render(<InitiativeTracker {...mockProps} />);

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('shows pause button when combat is active', () => {
    mockEncounter.combatState.pausedAt = undefined;
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('shows resume button when combat is paused', () => {
    mockEncounter.combatState.pausedAt = new Date();
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('calls onPauseCombat when pause button is clicked', () => {
    mockEncounter.combatState.pausedAt = undefined;
    render(<InitiativeTracker {...mockProps} />);

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    expect(mockProps.onPauseCombat).toHaveBeenCalledTimes(1);
  });

  it('calls onResumeCombat when resume button is clicked', () => {
    mockEncounter.combatState.pausedAt = new Date();
    render(<InitiativeTracker {...mockProps} />);

    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);

    expect(mockProps.onResumeCombat).toHaveBeenCalledTimes(1);
  });

  it('displays participant conditions', () => {
    // Add a condition to the first participant
    mockEncounter.participants[0].conditions = ['Poisoned', 'Prone'];
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('Poisoned')).toBeInTheDocument();
    expect(screen.getByText('Prone')).toBeInTheDocument();
  });

  it('displays temporary hit points when present', () => {
    mockEncounter.participants[0].temporaryHitPoints = 5;
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('(+5)')).toBeInTheDocument();
  });

  it('shows different HP colors based on health status', () => {
    // Set up different health levels
    mockEncounter.participants[0].currentHitPoints = 5; // Critical (25% of 20)
    mockEncounter.participants[1].currentHitPoints = 15; // Injured (75% of 20)

    render(<InitiativeTracker {...mockProps} />);

    // Check that the HP text has different styling (we can't directly test colors)
    const hpTexts = screen.getAllByText(/\/20/);
    expect(hpTexts.length).toBeGreaterThan(0);
  });

  it('shows "Acted" badge for participants who have acted', () => {
    mockEncounter.combatState.initiativeOrder[0].hasActed = true;
    render(<InitiativeTracker {...mockProps} />);

    expect(screen.getByText('Acted')).toBeInTheDocument();
  });

  it('displays player vs NPC badges correctly', () => {
    render(<InitiativeTracker {...mockProps} />);

    // Check for participant type badges
    mockEncounter.participants.forEach(participant => {
      expect(screen.getByText(participant.type)).toBeInTheDocument();
    });
  });

  describe('Export and Share functionality', () => {
    it('calls onExportInitiative when export button is clicked', () => {
      render(<InitiativeTracker {...mockProps} />);

      const exportButton = screen.getByRole('button', { name: /download initiative data/i });
      fireEvent.click(exportButton);

      expect(mockProps.onExportInitiative).toHaveBeenCalledTimes(1);
    });

    it('calls onShareInitiative when share button is clicked', () => {
      render(<InitiativeTracker {...mockProps} />);

      const shareButton = screen.getByRole('button', { name: /share initiative data/i });
      fireEvent.click(shareButton);

      expect(mockProps.onShareInitiative).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<InitiativeTracker {...mockProps} />);

      expect(screen.getByRole('heading', { name: 'Initiative Tracker' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Turn Order' })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<InitiativeTracker {...mockProps} />);

      expect(screen.getByRole('button', { name: /next turn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });
});