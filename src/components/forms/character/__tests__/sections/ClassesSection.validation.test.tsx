import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClassesSection } from '../../sections/ClassesSection';

describe('ClassesSection - Validation and Edge Cases', () => {
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