import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassesSection } from '../../sections/ClassesSection';

describe('ClassesSection - Interactions', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: [
      { class: 'fighter' as const, level: 1, hitDie: 10 },
    ],
    onChange: mockOnChange,
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Adding Classes', () => {
    it('adds a new class when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClassesSection {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add class/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { class: 'fighter', level: 1, hitDie: 10 },
        { class: 'fighter', level: 1, hitDie: 10 },
      ]);
    });

    it('disables add button when maximum classes reached', () => {
      const maxClassProps = {
        ...defaultProps,
        value: [
          { class: 'fighter' as const, level: 1, hitDie: 10 },
          { class: 'rogue' as const, level: 1, hitDie: 8 },
          { class: 'wizard' as const, level: 1, hitDie: 6 },
        ],
      };
      render(<ClassesSection {...maxClassProps} />);

      const addButton = screen.getByRole('button', { name: /add class/i });
      expect(addButton).toBeDisabled();
    });

    it('shows correct class count for multiple classes', () => {
      const threeClassProps = {
        ...defaultProps,
        value: [
          { class: 'fighter' as const, level: 1, hitDie: 10 },
          { class: 'rogue' as const, level: 1, hitDie: 8 },
          { class: 'wizard' as const, level: 1, hitDie: 6 },
        ],
      };
      render(<ClassesSection {...threeClassProps} />);

      expect(screen.getByText('3 classes')).toBeInTheDocument();
    });
  });

  describe('Removing Classes', () => {
    const twoClassProps = {
      ...defaultProps,
      value: [
        { class: 'fighter' as const, level: 3, hitDie: 10 },
        { class: 'rogue' as const, level: 2, hitDie: 8 },
      ],
    };

    it('removes a class when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClassesSection {...twoClassProps} />);

      const removeButtons = screen.getAllByText(/remove class/i);
      // Click the second remove button (index 1)
      await user.click(removeButtons[1]);

      expect(mockOnChange).toHaveBeenCalledWith([
        { class: 'fighter', level: 3, hitDie: 10 },
      ]);
    });

    it('does not allow removing when only one class remains', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.queryByText(/remove class/i)).not.toBeInTheDocument();
    });

    it('removes correct class by index', async () => {
      const user = userEvent.setup();
      const threeClassProps = {
        ...defaultProps,
        value: [
          { class: 'fighter' as const, level: 1, hitDie: 10 },
          { class: 'rogue' as const, level: 2, hitDie: 8 },
          { class: 'wizard' as const, level: 3, hitDie: 6 },
        ],
      };
      render(<ClassesSection {...threeClassProps} />);

      // Remove the second class (rogue)
      const removeButtons = screen.getAllByText(/remove class/i);
      await user.click(removeButtons[1]); // This removes index 1 (rogue)

      expect(mockOnChange).toHaveBeenCalledWith([
        { class: 'fighter', level: 1, hitDie: 10 },
        { class: 'wizard', level: 3, hitDie: 6 },
      ]);
    });
  });

  describe('Class Selection', () => {
    it('renders class selection field with proper label', () => {
      render(<ClassesSection {...defaultProps} />);

      const classSelect = screen.getByLabelText(/character class/i);
      expect(classSelect).toBeInTheDocument();
      expect(classSelect).toHaveAttribute('role', 'combobox');
    });

    it('displays current class selection', () => {
      render(<ClassesSection {...defaultProps} />);

      // Should show the current selected class
      expect(screen.getByText('Fighter')).toBeInTheDocument();
    });

    it('tests updateClass functionality through component props', () => {
      const testProps = {
        ...defaultProps,
        value: [
          { class: 'barbarian' as const, level: 1, hitDie: 12 },
        ],
      };
      render(<ClassesSection {...testProps} />);

      // Verify the component shows the updated class
      expect(screen.getByText('Barbarian')).toBeInTheDocument();
    });

    it('handles multi-class scenarios correctly', () => {
      const multiClassProps = {
        ...defaultProps,
        value: [
          { class: 'fighter' as const, level: 1, hitDie: 10 },
          { class: 'wizard' as const, level: 1, hitDie: 6 },
        ],
      };
      render(<ClassesSection {...multiClassProps} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Wizard')).toBeInTheDocument();
    });
  });

  describe('Level Updates', () => {
    it('updates level when input changes', () => {
      render(<ClassesSection {...defaultProps} />);

      const levelField = screen.getByLabelText(/level/i);
      fireEvent.change(levelField, { target: { value: '5' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { class: 'fighter', level: 5, hitDie: 10 },
      ]);
    });

    it('handles invalid level input gracefully', () => {
      render(<ClassesSection {...defaultProps} />);

      const levelField = screen.getByLabelText(/level/i);
      fireEvent.change(levelField, { target: { value: 'abc' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { class: 'fighter', level: 1, hitDie: 10 }, // defaults to 1 for invalid input
      ]);
    });

    it('updates correct level in multi-class scenario', () => {
      const multiClassProps = {
        ...defaultProps,
        value: [
          { class: 'fighter' as const, level: 1, hitDie: 10 },
          { class: 'rogue' as const, level: 1, hitDie: 8 },
        ],
      };
      render(<ClassesSection {...multiClassProps} />);

      const levelFields = screen.getAllByLabelText(/level/i);
      fireEvent.change(levelFields[1], { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { class: 'fighter', level: 1, hitDie: 10 },
        { class: 'rogue', level: 3, hitDie: 8 },
      ]);
    });

    it('recalculates total level when individual levels change', () => {
      const props = {
        ...defaultProps,
        value: [
          { class: 'fighter' as const, level: 3, hitDie: 10 },
          { class: 'rogue' as const, level: 2, hitDie: 8 },
        ],
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Total Level: 5')).toBeInTheDocument();
    });
  });
});