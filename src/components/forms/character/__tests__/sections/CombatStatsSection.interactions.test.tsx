import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CombatStatsSection } from '../../sections/CombatStatsSection';

describe('CombatStatsSection - Interactions', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: {
      hitPoints: {
        maximum: 10,
        current: 10,
        temporary: 0,
      },
      armorClass: 12,
      speed: 30,
      proficiencyBonus: 2,
    },
    onChange: mockOnChange,
    errors: {},
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 11,
      charisma: 10,
    },
    classes: [
      { className: 'fighter', level: 1 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Field Updates', () => {
    it('calls onChange when maximum hit points is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const maxHpField = screen.getByLabelText(/maximum hit points/i);
      fireEvent.change(maxHpField, { target: { value: '15' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          maximum: 15,
        },
      });
    });

    it('calls onChange when current hit points is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const currentHpField = screen.getByLabelText(/current hit points/i);
      fireEvent.change(currentHpField, { target: { value: '8' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          current: 8,
        },
      });
    });

    it('calls onChange when temporary hit points is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const tempHpField = screen.getByLabelText(/temporary hit points/i);
      fireEvent.change(tempHpField, { target: { value: '5' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          temporary: 5,
        },
      });
    });

    it('calls onChange when armor class is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const acField = screen.getByLabelText(/armor class/i);
      fireEvent.change(acField, { target: { value: '16' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        armorClass: 16,
      });
    });

    it('calls onChange when speed is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const speedField = screen.getByLabelText(/speed \(feet\)/i);
      fireEvent.change(speedField, { target: { value: '25' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        speed: 25,
      });
    });

    it('calls onChange when proficiency bonus is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const profBonusField = screen.getByLabelText(/proficiency bonus/i);
      fireEvent.change(profBonusField, { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        proficiencyBonus: 3,
      });
    });
  });

  describe('Helper Text and Modifiers', () => {
    it('displays constitution modifier in hit points helper text', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, constitution: 16 },
      };
      render(<CombatStatsSection {...props} />);

      // Constitution 16 = +3 modifier
      expect(screen.getByText(/CON modifier: \+3/i)).toBeInTheDocument();
    });

    it('displays dexterity modifier in armor class helper text', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, dexterity: 18 },
      };
      render(<CombatStatsSection {...props} />);

      // Dexterity 18 = +4 modifier
      expect(screen.getByText(/DEX modifier: \+4/i)).toBeInTheDocument();
    });

    it('handles negative constitution modifier', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, constitution: 8 },
      };
      render(<CombatStatsSection {...props} />);

      // Constitution 8 = -1 modifier
      expect(screen.getByText(/CON modifier: -1/i)).toBeInTheDocument();
    });

    it('shows default speed helper text', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByText(/default: 30 feet/i)).toBeInTheDocument();
    });

    it('shows temporary hit points as optional', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  describe('String Input Handling', () => {
    it('handles string input conversion to numbers', async () => {
      const user = userEvent.setup();
      render(<CombatStatsSection {...defaultProps} />);

      const maxHpField = screen.getByLabelText(/maximum hit points/i);
      await user.clear(maxHpField);
      await user.type(maxHpField, 'abc'); // invalid input

      fireEvent.blur(maxHpField);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          maximum: 0, // should convert invalid string to 0
        },
      });
    });

    it('correctly updates current HP max based on maximum HP', () => {
      const props = {
        ...defaultProps,
        value: {
          ...defaultProps.value,
          hitPoints: {
            maximum: 25,
            current: 20,
            temporary: 0,
          },
        },
      };
      render(<CombatStatsSection {...props} />);

      const currentHpField = screen.getByLabelText(/current hit points/i);
      expect(currentHpField).toHaveAttribute('max', '25');
    });
  });
});