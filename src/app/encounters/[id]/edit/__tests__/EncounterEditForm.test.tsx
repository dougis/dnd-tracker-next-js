/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterEditForm } from '../components/EncounterEditForm';
import {
  createTestEncounter,
  createTestParticipant,
} from '../../__tests__/test-helpers';

describe('EncounterEditForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnReset = jest.fn();

  const mockEncounter = createTestEncounter({
    name: 'Test Encounter',
    description: 'A test encounter description',
    difficulty: 'medium',
    estimatedDuration: 60,
    targetLevel: 5,
    participants: [
      createTestParticipant({
        name: 'Test Player',
        type: 'pc',
        maxHitPoints: 50,
        armorClass: 16,
      }),
    ],
    tags: ['test', 'combat'],
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: false,
      lairActionInitiative: undefined,
      enableGridMovement: false,
      gridSize: 5,
      roundTimeLimit: undefined,
      experienceThreshold: undefined,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form sections', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Participants')).toBeInTheDocument();
      expect(screen.getByText('Combat Settings')).toBeInTheDocument();
      expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should display form with proper accessibility attributes', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-label', 'Edit encounter form');
    });
  });

  describe('Basic Information Section', () => {
    it('should render basic info fields with correct values', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByDisplayValue('Test Encounter')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A test encounter description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
      expect(screen.getByDisplayValue('60')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Encounter');
      await user.clear(nameInput);

      const submitButton = screen.getByText('Save Encounter');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate numeric fields', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const durationInput = screen.getByDisplayValue('60');
      await user.clear(durationInput);
      await user.type(durationInput, '-10');

      const submitButton = screen.getByText('Save Encounter');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Duration must be positive')).toBeInTheDocument();
      });
    });

    it('should validate level range', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const levelInput = screen.getByDisplayValue('5');
      await user.clear(levelInput);
      await user.type(levelInput, '25');

      const submitButton = screen.getByText('Save Encounter');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Level must be between 1 and 20')).toBeInTheDocument();
      });
    });
  });

  describe('Tags Management', () => {
    it('should display existing tags', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('combat')).toBeInTheDocument();
    });

    it('should allow adding new tags', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const tagInput = screen.getByPlaceholderText('Add tag...');
      await user.type(tagInput, 'new-tag{enter}');

      expect(screen.getByText('new-tag')).toBeInTheDocument();
    });

    it('should allow removing tags', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const removeButton = screen.getAllByLabelText('Remove tag')[0];
      await user.click(removeButton);

      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });
  });

  describe('Participants Section', () => {
    it('should display participant list', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByText('Test Player')).toBeInTheDocument();
      expect(screen.getByText('HP: 50/50')).toBeInTheDocument();
      expect(screen.getByText('AC: 16')).toBeInTheDocument();
    });

    it('should show add participant button', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByText('Add Participant')).toBeInTheDocument();
    });

    it('should validate minimum participant requirement', async () => {
      const user = userEvent.setup();
      const emptyEncounter = createTestEncounter({ participants: [] });

      render(
        <EncounterEditForm
          encounter={emptyEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const submitButton = screen.getByText('Save Encounter');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('At least one participant is required')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Section', () => {
    it('should render all setting toggles', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByLabelText('Allow Player Visibility')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto-roll Initiative')).toBeInTheDocument();
      expect(screen.getByLabelText('Track Resources')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Lair Actions')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Grid Movement')).toBeInTheDocument();
    });

    it('should reflect current setting values', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByLabelText('Allow Player Visibility')).toHaveAttribute('data-state', 'checked');
      expect(screen.getByLabelText('Auto-roll Initiative')).toHaveAttribute('data-state', 'unchecked');
      expect(screen.getByLabelText('Track Resources')).toHaveAttribute('data-state', 'checked');
      expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'unchecked');
      expect(screen.getByLabelText('Enable Grid Movement')).toHaveAttribute('data-state', 'unchecked');
    });

    it('should show conditional lair action settings', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const lairToggle = screen.getByLabelText('Enable Lair Actions');
      await user.click(lairToggle);

      expect(screen.getByLabelText('Lair Action Initiative')).toBeInTheDocument();
    });

    it('should show conditional grid movement settings', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const gridToggle = screen.getByLabelText('Enable Grid Movement');
      await user.click(gridToggle);

      expect(screen.getByLabelText('Grid Size (feet)')).toBeInTheDocument();
    });
  });

  describe('Form Actions', () => {
    it('should call onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const submitButton = screen.getByText('Save Encounter');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Encounter',
            description: 'A test encounter description',
            difficulty: 'medium',
          })
        );
      });
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call onReset when reset button clicked', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should disable submit button when submitting', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByText('Saving...');
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state when submitting', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={true}
        />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Save Encounter')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      expect(screen.getByLabelText('Encounter Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Difficulty')).toBeInTheDocument();
      expect(screen.getByLabelText('Estimated Duration (minutes)')).toBeInTheDocument();
      expect(screen.getByLabelText('Target Level')).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByLabelText('Encounter Name');
      await user.clear(nameInput);
      await user.click(screen.getByText('Save Encounter'));

      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required');
        expect(errorMessage).toBeInTheDocument();
        expect(nameInput).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <EncounterEditForm
          encounter={mockEncounter}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onReset={mockOnReset}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByLabelText('Encounter Name');
      const descriptionInput = screen.getByLabelText('Description');

      await user.click(nameInput);
      await user.tab();

      expect(descriptionInput).toHaveFocus();
    });
  });
});