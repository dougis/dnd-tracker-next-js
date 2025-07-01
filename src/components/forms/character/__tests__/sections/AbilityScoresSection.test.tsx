import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AbilityScoresSection } from '../../sections/AbilityScoresSection';

describe('AbilityScoresSection', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    onChange: mockOnChange,
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ability Score Fields', () => {
    const abilities = [
      { name: 'Strength', key: 'strength', abbreviation: 'STR' },
      { name: 'Dexterity', key: 'dexterity', abbreviation: 'DEX' },
      { name: 'Constitution', key: 'constitution', abbreviation: 'CON' },
      { name: 'Intelligence', key: 'intelligence', abbreviation: 'INT' },
      { name: 'Wisdom', key: 'wisdom', abbreviation: 'WIS' },
      { name: 'Charisma', key: 'charisma', abbreviation: 'CHA' },
    ];

    it('renders all six ability score fields', () => {
      render(<AbilityScoresSection {...defaultProps} />);

      abilities.forEach(ability => {
        expect(screen.getByLabelText(new RegExp(ability.name, 'i'))).toBeInTheDocument();
      });
    });

    it('shows ability score abbreviations', () => {
      render(<AbilityScoresSection {...defaultProps} />);

      abilities.forEach(ability => {
        expect(screen.getByText(ability.abbreviation)).toBeInTheDocument();
      });
    });

    it('displays current ability score values', () => {
      const props = {
        ...defaultProps,
        value: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 11,
          charisma: 10,
        },
      };
      render(<AbilityScoresSection {...props} />);

      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('14')).toBeInTheDocument();
      expect(screen.getByDisplayValue('13')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('has proper number input attributes', () => {
      render(<AbilityScoresSection {...defaultProps} />);

      abilities.forEach(ability => {
        const field = screen.getByLabelText(new RegExp(ability.name, 'i'));
        expect(field).toHaveAttribute('type', 'number');
        expect(field).toHaveAttribute('min', '1');
        expect(field).toHaveAttribute('max', '30');
        expect(field).toHaveAttribute('aria-required', 'true');
      });
    });

    it('calls onChange when ability scores are modified', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const strengthField = screen.getByLabelText(/strength/i);
      await user.clear(strengthField);
      await user.type(strengthField, '18');

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        strength: 18,
      }));
    });
  });

  describe('Ability Modifiers', () => {
    it('displays calculated ability modifiers', () => {
      const props = {
        ...defaultProps,
        value: {
          strength: 16, // +3
          dexterity: 14, // +2
          constitution: 12, // +1
          intelligence: 10, // +0
          wisdom: 8,     // -1
          charisma: 6,   // -2
        },
      };
      render(<AbilityScoresSection {...props} />);

      expect(screen.getByText('+3')).toBeInTheDocument(); // STR
      expect(screen.getByText('+2')).toBeInTheDocument(); // DEX
      expect(screen.getByText('+1')).toBeInTheDocument(); // CON
      expect(screen.getByText('+0')).toBeInTheDocument(); // INT
      expect(screen.getByText('-1')).toBeInTheDocument(); // WIS
      expect(screen.getByText('-2')).toBeInTheDocument(); // CHA
    });

    it('updates modifiers in real-time when scores change', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const strengthField = screen.getByLabelText(/strength/i);
      await user.clear(strengthField);
      await user.type(strengthField, '20');

      // Wait for modifier to update
      await waitFor(() => {
        expect(screen.getByText('+5')).toBeInTheDocument();
      });
    });
  });

  describe('Point Buy System', () => {
    it('shows point buy calculator when enabled', () => {
      const props = {
        ...defaultProps,
        showPointBuy: true,
      };
      render(<AbilityScoresSection {...props} />);

      expect(screen.getByText(/point buy/i)).toBeInTheDocument();
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
    });

    it('calculates points used in point buy system', () => {
      const props = {
        ...defaultProps,
        showPointBuy: true,
        value: {
          strength: 15, // 9 points
          dexterity: 14, // 7 points
          constitution: 13, // 5 points
          intelligence: 12, // 4 points
          wisdom: 10,     // 2 points
          charisma: 8,    // 0 points
        },
      };
      render(<AbilityScoresSection {...props} />);

      // Total: 27 points used, 0 remaining (standard point buy is 27)
      expect(screen.getByText('0 points remaining')).toBeInTheDocument();
    });

    it('shows warning when over point buy limit', () => {
      const props = {
        ...defaultProps,
        showPointBuy: true,
        value: {
          strength: 15,
          dexterity: 15,
          constitution: 15,
          intelligence: 15,
          wisdom: 15,
          charisma: 15,
        },
      };
      render(<AbilityScoresSection {...props} />);

      expect(screen.getByText(/over point buy limit/i)).toBeInTheDocument();
    });

    it('allows toggling point buy mode', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const pointBuyToggle = screen.getByLabelText(/use point buy/i);
      await user.click(pointBuyToggle);

      expect(screen.getByText(/point buy/i)).toBeInTheDocument();
    });
  });

  describe('Standard Array Option', () => {
    it('shows standard array button', () => {
      render(<AbilityScoresSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: /use standard array/i })).toBeInTheDocument();
    });

    it('applies standard array when clicked', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const standardArrayButton = screen.getByRole('button', { name: /use standard array/i });
      await user.click(standardArrayButton);

      // Standard array: 15, 14, 13, 12, 10, 8
      const expectedValues = [15, 14, 13, 12, 10, 8];
      const fields = screen.getAllByRole('spinbutton');
      
      expectedValues.forEach((value, index) => {
        expect(fields[index]).toHaveValue(value);
      });

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      }));
    });
  });

  describe('Random Generation', () => {
    it('shows roll dice button', () => {
      render(<AbilityScoresSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    });

    it('generates random ability scores when clicked', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const rollDiceButton = screen.getByRole('button', { name: /roll dice/i });
      await user.click(rollDiceButton);

      // Should call onChange with new random values
      expect(mockOnChange).toHaveBeenCalled();
      const calledWith = mockOnChange.mock.calls[0][0];
      
      // All values should be between 3 and 18 (4d6 drop lowest range)
      Object.values(calledWith).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(3);
        expect(value).toBeLessThanOrEqual(18);
      });
    });

    it('shows dice roll animation', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const rollDiceButton = screen.getByRole('button', { name: /roll dice/i });
      await user.click(rollDiceButton);

      expect(screen.getByTestId('dice-animation')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows validation errors for invalid ability scores', () => {
      const props = {
        ...defaultProps,
        errors: {
          strength: 'Strength must be between 1 and 30',
          dexterity: 'Dexterity must be between 1 and 30',
        },
      };
      render(<AbilityScoresSection {...props} />);

      expect(screen.getByText('Strength must be between 1 and 30')).toBeInTheDocument();
      expect(screen.getByText('Dexterity must be between 1 and 30')).toBeInTheDocument();
    });

    it('marks fields with errors as invalid', () => {
      const props = {
        ...defaultProps,
        errors: {
          strength: 'Strength must be between 1 and 30',
        },
      };
      render(<AbilityScoresSection {...props} />);

      const strengthField = screen.getByLabelText(/strength/i);
      expect(strengthField).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Section Layout', () => {
    it('renders section header with proper title', () => {
      render(<AbilityScoresSection {...defaultProps} />);
      
      expect(screen.getByText('Ability Scores')).toBeInTheDocument();
      expect(screen.getByText(/fundamental attributes/i)).toBeInTheDocument();
    });

    it('arranges ability scores in a responsive grid', () => {
      render(<AbilityScoresSection {...defaultProps} />);
      
      const section = screen.getByTestId('ability-scores-grid');
      expect(section).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-3', 'gap-4');
    });

    it('groups generation tools together', () => {
      render(<AbilityScoresSection {...defaultProps} />);
      
      const toolsContainer = screen.getByTestId('generation-tools');
      expect(toolsContainer).toContainElement(screen.getByRole('button', { name: /use standard array/i }));
      expect(toolsContainer).toContainElement(screen.getByRole('button', { name: /roll dice/i }));
    });
  });

  describe('Accessibility', () => {
    it('has proper section heading structure', () => {
      render(<AbilityScoresSection {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: /ability scores/i });
      expect(heading).toHaveAttribute('aria-level', '3');
    });

    it('associates ability modifiers with their scores', () => {
      render(<AbilityScoresSection {...defaultProps} />);
      
      const strengthField = screen.getByLabelText(/strength/i);
      const strengthModifier = screen.getByTestId('strength-modifier');
      
      expect(strengthField).toHaveAttribute('aria-describedby');
      expect(strengthModifier).toHaveAttribute('id', strengthField.getAttribute('aria-describedby')?.split(' ')[0]);
    });

    it('announces dice rolls to screen readers', async () => {
      const user = userEvent.setup();
      render(<AbilityScoresSection {...defaultProps} />);

      const rollDiceButton = screen.getByRole('button', { name: /roll dice/i });
      await user.click(rollDiceButton);

      expect(screen.getByText(/ability scores rolled/i)).toHaveAttribute('aria-live', 'polite');
    });
  });
});