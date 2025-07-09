import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClassesSection } from '../../sections/ClassesSection';
import { createClassesSectionProps, singleFighter } from '../helpers/ClassesSection.helpers';

describe('ClassesSection - Rendering and Display', () => {
  const mockOnChange = jest.fn();
  const defaultProps = createClassesSectionProps(singleFighter(), {}, mockOnChange);

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
        { class: 'fighter' as const, level: 3, hitDie: 10 },
        { class: 'rogue' as const, level: 2, hitDie: 8 },
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
});