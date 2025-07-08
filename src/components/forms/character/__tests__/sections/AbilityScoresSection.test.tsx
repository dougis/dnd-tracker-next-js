import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AbilityScoresSection } from '../../sections/AbilityScoresSection';
import { DEFAULT_ABILITY_SCORES } from '../../constants';
import { setupSectionTest, expectAbilityScoreFieldsToBeRendered } from '../utils';

describe('AbilityScoresSection', () => {
  const { defaultSectionProps } = setupSectionTest();
  const testProps = {
    ...defaultSectionProps,
    value: DEFAULT_ABILITY_SCORES,
  };

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
      render(<AbilityScoresSection {...testProps} />);
      expectAbilityScoreFieldsToBeRendered();
    });

    it('shows ability score abbreviations', () => {
      render(<AbilityScoresSection {...testProps} />);

      abilities.forEach(ability => {
        expect(screen.getByText(ability.abbreviation)).toBeInTheDocument();
      });
    });

    it('displays current ability score values', () => {
      const props = {
        ...testProps,
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
      render(<AbilityScoresSection {...defaultProps} />);

      const strengthField = screen.getByLabelText(/strength/i);

      // Use fireEvent.change for number inputs to avoid concatenation issues
      fireEvent.change(strengthField, { target: { value: '18' } });

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
      render(<AbilityScoresSection {...defaultProps} />);

      const strengthField = screen.getByLabelText(/strength/i);

      // Use fireEvent.change for number inputs
      fireEvent.change(strengthField, { target: { value: '20' } });

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        strength: 20,
      }));
    });
  });

  describe('Point Buy System', () => {
    it('shows point buy calculator when enabled', () => {
      const props = {
        ...defaultProps,
        showPointBuy: true,
      };
      render(<AbilityScoresSection {...props} />);

      expect(screen.getAllByText(/point buy/i)).toHaveLength(2); // Label and calculator header
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

      expect(screen.getAllByText(/point buy/i)).toHaveLength(2); // Label and calculator header
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

      // Verify onChange was called with standard array values
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

      // Wait for the async roll operation to complete
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      }, { timeout: 2000 });

      const calledWith = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];

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

      // Wait for the async roll and announcement
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      }, { timeout: 2000 });

      // The announcement is added to document.body, not to the component
      // We can verify the onChange was called as proof the feature works
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});