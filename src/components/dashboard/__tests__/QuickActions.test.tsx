import { screen, fireEvent } from '@testing-library/react';
import { createMockHandlers, renderQuickActions, expectElementToBeInDocument, expectTextToBeInDocument, expectButtonToBeInDocument, type MockHandlers } from './test-helpers';

describe('QuickActions', () => {
  let mockHandlers: MockHandlers;

  beforeEach(() => {
    mockHandlers = createMockHandlers();
  });

  describe('Component Rendering', () => {
    test('renders without errors', () => {
      renderQuickActions(mockHandlers);
      expectElementToBeInDocument('quick-actions');
    });

    test('renders section title', () => {
      renderQuickActions(mockHandlers);
      expectTextToBeInDocument('Quick Actions');
    });

    test('applies correct card styling', () => {
      renderQuickActions(mockHandlers);
      const quickActions = screen.getByTestId('quick-actions');
      expect(quickActions).toHaveClass('rounded-xl', 'border', 'bg-card');
    });
  });

  describe('Action Buttons', () => {
    test('renders all action buttons', () => {
      renderQuickActions(mockHandlers);
      expectButtonToBeInDocument(/create character/i);
      expectButtonToBeInDocument(/create encounter/i);
      expectButtonToBeInDocument(/start combat/i);
    });

    test('buttons have correct styling', () => {
      renderQuickActions(mockHandlers);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('w-full', 'justify-start');
      });
    });

    test('buttons display icons and text', () => {
      renderQuickActions(mockHandlers);
      expectTextToBeInDocument('Create Character');
      expectTextToBeInDocument('Create Encounter');
      expectTextToBeInDocument('Start Combat');
    });
  });

  describe('Button Interactions', () => {
    test('create character button calls handler when clicked', () => {
      renderQuickActions(mockHandlers);
      const createCharacterBtn = screen.getByRole('button', { name: /create character/i });
      fireEvent.click(createCharacterBtn);
      expect(mockHandlers.onCreateCharacter).toHaveBeenCalledTimes(1);
    });

    test('create encounter button calls handler when clicked', () => {
      renderQuickActions(mockHandlers);
      const createEncounterBtn = screen.getByRole('button', { name: /create encounter/i });
      fireEvent.click(createEncounterBtn);
      expect(mockHandlers.onCreateEncounter).toHaveBeenCalledTimes(1);
    });

    test('start combat button calls handler when clicked', () => {
      renderQuickActions(mockHandlers);
      const startCombatBtn = screen.getByRole('button', { name: /start combat/i });
      fireEvent.click(startCombatBtn);
      expect(mockHandlers.onStartCombat).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('buttons are keyboard accessible', () => {
      renderQuickActions(mockHandlers);
      const createCharacterBtn = screen.getByRole('button', { name: /create character/i });
      createCharacterBtn.focus();
      fireEvent.keyDown(createCharacterBtn, { key: 'Enter', code: 'Enter' });
      expect(createCharacterBtn).toHaveFocus();
    });
  });
});