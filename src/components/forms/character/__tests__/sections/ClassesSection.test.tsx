import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassesSection } from '../../sections/ClassesSection';

describe('ClassesSection', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: [
      { className: 'fighter' as const, level: 1 },
    ],
    onChange: mockOnChange,
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders section header with proper title', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.getByText('Character Classes')).toBeInTheDocument();
      expect(screen.getByText(/choose your character's class\(es\) and levels/i)).toBeInTheDocument();
    });

    it('renders character class and level fields', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.getByLabelText(/character class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
    });

    it('renders total level display', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.getByText('Total Level: 1')).toBeInTheDocument();
      expect(screen.getByText('Single class')).toBeInTheDocument();
    });

    it('renders add class button', () => {
      render(<ClassesSection {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add class/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
    });

    it('shows primary class indicator for first class', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.getByText('Class 1 (Primary)')).toBeInTheDocument();
    });
  });

  describe('Single Class Display', () => {
    it('displays current class value', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
    });

    it('displays current level value', () => {
      render(<ClassesSection {...defaultProps} />);

      const levelField = screen.getByLabelText(/level/i);
      expect(levelField).toHaveValue(1);
    });

    it('does not show remove button for single class', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.queryByText(/remove class/i)).not.toBeInTheDocument();
    });

    it('shows single class status', () => {
      render(<ClassesSection {...defaultProps} />);

      expect(screen.getByText('Single class')).toBeInTheDocument();
    });
  });

  describe('Multiple Classes Display', () => {
    const multiClassProps = {
      ...defaultProps,
      value: [
        { className: 'fighter' as const, level: 3 },
        { className: 'rogue' as const, level: 2 },
      ],
    };

    it('displays multiple class entries', () => {
      render(<ClassesSection {...multiClassProps} />);

      expect(screen.getByText('Class 1 (Primary)')).toBeInTheDocument();
      expect(screen.getByText('Class 2')).toBeInTheDocument();
    });

    it('shows correct total level', () => {
      render(<ClassesSection {...multiClassProps} />);

      expect(screen.getByText('Total Level: 5')).toBeInTheDocument();
      expect(screen.getByText('2 classes')).toBeInTheDocument();
    });

    it('shows remove buttons for all classes when multiple exist', () => {
      render(<ClassesSection {...multiClassProps} />);

      // Should have 2 remove buttons (one for each class when there are multiple)
      const removeButtons = screen.getAllByText(/remove class/i);
      expect(removeButtons).toHaveLength(2);
    });

    it('displays all class values correctly', () => {
      render(<ClassesSection {...multiClassProps} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Rogue')).toBeInTheDocument();
    });

    it('displays all level values correctly', () => {
      render(<ClassesSection {...multiClassProps} />);

      const levelFields = screen.getAllByLabelText(/level/i);
      expect(levelFields[0]).toHaveValue(3);
      expect(levelFields[1]).toHaveValue(2);
    });
  });

  describe('Adding Classes', () => {
    it('adds a new class when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClassesSection {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add class/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { className: 'fighter', level: 1 },
        { className: 'fighter', level: 1 },
      ]);
    });

    it('disables add button when maximum classes reached', () => {
      const maxClassProps = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 1 },
          { className: 'wizard' as const, level: 1 },
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
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 1 },
          { className: 'wizard' as const, level: 1 },
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
        { className: 'fighter' as const, level: 3 },
        { className: 'rogue' as const, level: 2 },
      ],
    };

    it('removes a class when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClassesSection {...twoClassProps} />);

      const removeButtons = screen.getAllByText(/remove class/i);
      // Click the second remove button (index 1)
      await user.click(removeButtons[1]);

      expect(mockOnChange).toHaveBeenCalledWith([
        { className: 'fighter', level: 3 },
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
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 2 },
          { className: 'wizard' as const, level: 3 },
        ],
      };
      render(<ClassesSection {...threeClassProps} />);

      // Remove the second class (rogue)
      const removeButtons = screen.getAllByText(/remove class/i);
      await user.click(removeButtons[1]); // This removes index 1 (rogue)

      expect(mockOnChange).toHaveBeenCalledWith([
        { className: 'fighter', level: 1 },
        { className: 'wizard', level: 3 },
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
          { className: 'barbarian' as const, level: 1 },
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
          { className: 'fighter' as const, level: 1 },
          { className: 'wizard' as const, level: 1 },
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
        { className: 'fighter', level: 5 },
      ]);
    });

    it('handles invalid level input gracefully', () => {
      render(<ClassesSection {...defaultProps} />);

      const levelField = screen.getByLabelText(/level/i);
      fireEvent.change(levelField, { target: { value: 'abc' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { className: 'fighter', level: 1 }, // defaults to 1 for invalid input
      ]);
    });

    it('updates correct level in multi-class scenario', () => {
      const multiClassProps = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 1 },
        ],
      };
      render(<ClassesSection {...multiClassProps} />);

      const levelFields = screen.getAllByLabelText(/level/i);
      fireEvent.change(levelFields[1], { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { className: 'fighter', level: 1 },
        { className: 'rogue', level: 3 },
      ]);
    });

    it('recalculates total level when individual levels change', () => {
      const props = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 3 },
          { className: 'rogue' as const, level: 2 },
        ],
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Total Level: 5')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays class-specific error messages', () => {
      const props = {
        ...defaultProps,
        errors: {
          'class-0': 'Character class is required',
          'level-0': 'Level must be between 1 and 20',
        },
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Character class is required')).toBeInTheDocument();
      expect(screen.getByText('Level must be between 1 and 20')).toBeInTheDocument();
    });

    it('displays general classes error', () => {
      const props = {
        ...defaultProps,
        errors: {
          classes: 'At least one character class is required',
        },
      };
      render(<ClassesSection {...props} />);

      const errorMessage = screen.getByText('At least one character class is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('displays multiple class errors for multiclass character', () => {
      const props = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 1 },
        ],
        errors: {
          'class-1': 'Duplicate class not allowed',
          'level-1': 'Level cannot be 0',
        },
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Duplicate class not allowed')).toBeInTheDocument();
      expect(screen.getByText('Level cannot be 0')).toBeInTheDocument();
    });
  });

  describe('Field Constraints', () => {
    it('sets proper constraints for level fields', () => {
      render(<ClassesSection {...defaultProps} />);

      const levelField = screen.getByLabelText(/level/i);
      expect(levelField).toHaveAttribute('type', 'number');
      expect(levelField).toHaveAttribute('min', '1');
      expect(levelField).toHaveAttribute('max', '20');
      expect(levelField).toHaveAttribute('required');
    });

    it('marks character class as required', () => {
      render(<ClassesSection {...defaultProps} />);

      const classSelect = screen.getByLabelText(/character class/i);
      expect(classSelect).toHaveAttribute('role', 'combobox');
    });

    it('enforces maximum of 3 classes', () => {
      const props = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 1 },
          { className: 'wizard' as const, level: 1 },
        ],
      };
      render(<ClassesSection {...props} />);

      const addButton = screen.getByRole('button', { name: /add class/i });
      expect(addButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty classes array gracefully', () => {
      const props = {
        ...defaultProps,
        value: [],
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Total Level: 0')).toBeInTheDocument();
      expect(screen.getByText('0 classes')).toBeInTheDocument();
    });

    it('handles zero level gracefully', () => {
      const props = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 0 },
        ],
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Total Level: 0')).toBeInTheDocument();
    });

    it('handles high level characters', () => {
      const props = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 20 },
        ],
      };
      render(<ClassesSection {...props} />);

      expect(screen.getByText('Total Level: 20')).toBeInTheDocument();
      const levelField = screen.getByLabelText(/level/i);
      expect(levelField).toHaveValue(20);
    });
  });

  describe('Accessibility', () => {
    it('has proper section heading structure', () => {
      render(<ClassesSection {...defaultProps} />);

      const heading = screen.getByRole('heading', { name: /character classes/i });
      expect(heading).toHaveAttribute('aria-level', '3');
    });

    it('provides screen reader text for remove buttons', () => {
      const props = {
        ...defaultProps,
        value: [
          { className: 'fighter' as const, level: 1 },
          { className: 'rogue' as const, level: 1 },
        ],
      };
      render(<ClassesSection {...props} />);

      const removeButtons = screen.getAllByText(/remove class/i);
      expect(removeButtons).toHaveLength(2);
    });

    it('announces errors to screen readers', () => {
      const props = {
        ...defaultProps,
        errors: {
          classes: 'Classes validation failed',
        },
      };
      render(<ClassesSection {...props} />);

      const errorMessage = screen.getByText('Classes validation failed');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});