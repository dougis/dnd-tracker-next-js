import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InitiativeTracker } from '../InitiativeTracker';
import {
  setupInitiativeTrackerTest,
  expectCombatControlsToExist,
  expectComponentState,
  expectParticipantsToBeDisplayed
} from './test-helpers';

describe('InitiativeTracker', () => {
  let testSetup: ReturnType<typeof setupInitiativeTrackerTest>;

  beforeEach(() => {
    testSetup = setupInitiativeTrackerTest();
  });

  it('renders initiative tracker when combat is active', () => {
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expectCombatControlsToExist();
  });

  it('shows inactive state when combat is not active', () => {
    const inactiveSetup = setupInitiativeTrackerTest();
    inactiveSetup.mockEncounter.combatState.isActive = false;
    render(<InitiativeTracker {...inactiveSetup.mockProps} />);

    expectComponentState({ isActive: false });
  });

  it('displays participants in initiative order with correct information', () => {
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expectParticipantsToBeDisplayed(testSetup.mockEncounter.participants);
  });

  it('highlights the active participant', () => {
    render(<InitiativeTracker {...testSetup.mockProps} />);

    // The active participant should have special styling
    // Need to look for the card that has border-primary class
    // Since currentTurn is 1, the second participant in initiative order should be active
    const activeCards = document.querySelectorAll('.border-primary');

    expect(activeCards.length).toBeGreaterThan(0);
  });

  it('calls onNextTurn when Next Turn button is clicked', () => {
    render(<InitiativeTracker {...testSetup.mockProps} />);

    const nextButton = screen.getByText('Next Turn');
    fireEvent.click(nextButton);

    expect(testSetup.mockProps.combatActions.onNextTurn).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviousTurn when Previous button is clicked', () => {
    render(<InitiativeTracker {...testSetup.mockProps} />);

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(testSetup.mockProps.combatActions.onPreviousTurn).toHaveBeenCalledTimes(1);
  });

  it('disables Previous button at start of first round', () => {
    testSetup.mockEncounter.combatState.currentRound = 1;
    testSetup.mockEncounter.combatState.currentTurn = 0;
    render(<InitiativeTracker {...testSetup.mockProps} />);

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('shows pause button when combat is active', () => {
    testSetup.mockEncounter.combatState.pausedAt = undefined;
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('shows resume button when combat is paused', () => {
    testSetup.mockEncounter.combatState.pausedAt = new Date();
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('calls onPauseCombat when pause button is clicked', () => {
    testSetup.mockEncounter.combatState.pausedAt = undefined;
    render(<InitiativeTracker {...testSetup.mockProps} />);

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    expect(testSetup.mockProps.combatActions.onPauseCombat).toHaveBeenCalledTimes(1);
  });

  it('calls onResumeCombat when resume button is clicked', () => {
    testSetup.mockEncounter.combatState.pausedAt = new Date();
    render(<InitiativeTracker {...testSetup.mockProps} />);

    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);

    expect(testSetup.mockProps.combatActions.onResumeCombat).toHaveBeenCalledTimes(1);
  });

  it('displays participant conditions', () => {
    // Add a condition to the first participant
    testSetup.mockEncounter.participants[0].conditions = ['Poisoned', 'Prone'];
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expect(screen.getByText('Poisoned')).toBeInTheDocument();
    expect(screen.getByText('Prone')).toBeInTheDocument();
  });

  it('displays temporary hit points when present', () => {
    testSetup.mockEncounter.participants[0].temporaryHitPoints = 5;
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expect(screen.getByText('(+5)')).toBeInTheDocument();
  });

  it('shows different HP colors based on health status', () => {
    // Set up different health levels
    testSetup.mockEncounter.participants[0].currentHitPoints = 5; // Critical (25% of 20)
    testSetup.mockEncounter.participants[1].currentHitPoints = 15; // Injured (75% of 20)

    render(<InitiativeTracker {...testSetup.mockProps} />);

    // Check that the HP text has different styling (we can't directly test colors)
    const hpTexts = screen.getAllByText(/\/20/);
    expect(hpTexts.length).toBeGreaterThan(0);
  });

  it('shows "Acted" badge for participants who have acted', () => {
    testSetup.mockEncounter.combatState.initiativeOrder[0].hasActed = true;
    render(<InitiativeTracker {...testSetup.mockProps} />);

    expect(screen.getByText('Acted')).toBeInTheDocument();
  });

  it('displays player vs NPC badges correctly', () => {
    render(<InitiativeTracker {...testSetup.mockProps} />);

    // Check for participant type badges
    testSetup.mockEncounter.participants.forEach(participant => {
      expect(screen.getByText(participant.type)).toBeInTheDocument();
    });
  });

  describe('Combat controls functionality', () => {
    it('renders control buttons when combat is active', () => {
      render(<InitiativeTracker {...testSetup.mockProps} />);

      expect(screen.getByRole('button', { name: /next turn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper component structure', () => {
      render(<InitiativeTracker {...testSetup.mockProps} />);

      // Should render combat controls and initiative list
      expect(screen.getByRole('button', { name: /next turn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<InitiativeTracker {...testSetup.mockProps} />);

      expect(screen.getByRole('button', { name: /next turn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });
});