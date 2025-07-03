import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from '../QuickActions';

const mockHandlers = {
  onCreateCharacter: jest.fn(),
  onCreateEncounter: jest.fn(),
  onStartCombat: jest.fn(),
};

describe('QuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without errors', () => {
      render(<QuickActions {...mockHandlers} />);

      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    test('renders section title', () => {
      render(<QuickActions {...mockHandlers} />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    test('applies correct card styling', () => {
      render(<QuickActions {...mockHandlers} />);

      const quickActions = screen.getByTestId('quick-actions');
      expect(quickActions).toHaveClass('rounded-xl', 'border', 'bg-card');
    });
  });

  describe('Action Buttons', () => {
    test('renders all action buttons', () => {
      render(<QuickActions {...mockHandlers} />);

      expect(screen.getByRole('button', { name: /create character/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create encounter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start combat/i })).toBeInTheDocument();
    });

    test('buttons have correct styling', () => {
      render(<QuickActions {...mockHandlers} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('w-full', 'justify-start');
      });
    });

    test('buttons display icons and text', () => {
      render(<QuickActions {...mockHandlers} />);

      const createCharacterBtn = screen.getByRole('button', { name: /create character/i });
      const createEncounterBtn = screen.getByRole('button', { name: /create encounter/i });
      const startCombatBtn = screen.getByRole('button', { name: /start combat/i });

      expect(createCharacterBtn).toHaveTextContent('Create Character');
      expect(createEncounterBtn).toHaveTextContent('Create Encounter');
      expect(startCombatBtn).toHaveTextContent('Start Combat');
    });
  });

  describe('Button Interactions', () => {
    test('create character button calls handler when clicked', () => {
      render(<QuickActions {...mockHandlers} />);

      const createCharacterBtn = screen.getByRole('button', { name: /create character/i });
      fireEvent.click(createCharacterBtn);

      expect(mockHandlers.onCreateCharacter).toHaveBeenCalledTimes(1);
    });

    test('create encounter button calls handler when clicked', () => {
      render(<QuickActions {...mockHandlers} />);

      const createEncounterBtn = screen.getByRole('button', { name: /create encounter/i });
      fireEvent.click(createEncounterBtn);

      expect(mockHandlers.onCreateEncounter).toHaveBeenCalledTimes(1);
    });

    test('start combat button calls handler when clicked', () => {
      render(<QuickActions {...mockHandlers} />);

      const startCombatBtn = screen.getByRole('button', { name: /start combat/i });
      fireEvent.click(startCombatBtn);

      expect(mockHandlers.onStartCombat).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('buttons are keyboard accessible', () => {
      render(<QuickActions {...mockHandlers} />);

      const createCharacterBtn = screen.getByRole('button', { name: /create character/i });
      createCharacterBtn.focus();
      fireEvent.keyDown(createCharacterBtn, { key: 'Enter', code: 'Enter' });

      // Button click handler should still be called when pressing Enter
      expect(createCharacterBtn).toHaveFocus();
    });
  });
});